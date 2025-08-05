import sharp from "sharp";

async function assessImageBrightness(_image, metadata) {
  const image = _image.clone();
  // Convert image to grayscale and get raw buffer
  const buffer = await image
      .grayscale()
      .raw()
      .toBuffer();

  let totalBrightness = 0;
  // Sum up all pixel values
  for (let i = 0; i < buffer.length; i++) {
      totalBrightness += buffer[i];
  }

  // Calculate average brightness
  const averageBrightness = totalBrightness / (metadata.width * metadata.height);

  // Define threshold for brightness, this is arbitrary and might need adjustment
  const threshold = 128; // mid-point of 256

  if (averageBrightness > threshold) {
      return 'bright';
  } else {
      return 'dark';
  }
}

async function generateImage({source, text, type, watermark, layout, rotated, opacity, width, position, quality, style, size, textColor}) {
  try{
    const inputImageSrc = await fetch(source).then((res) => res.arrayBuffer());
  
    const main = async () => {
      try {
        const inputImage = sharp(inputImageSrc);
        const [inputWidth, height, format] = await inputImage
        .metadata()
        .then((metadata) => {
          return [metadata.width, metadata.height, metadata.format];
        });

        const imageBrightness = await assessImageBrightness(inputImage, {width: inputWidth, height: height});
        const _textColor = (typeof textColor !== "undefined" && textColor !== "undefined") ? textColor : imageBrightness == 'dark' ? 'white' : 'black';
  
        // Add padding to the logo as 2% of the width and height
        const paddingPercent = (layout == 'grid' && rotated != 'true') ? 5 : 1.5;
        const paddingX = Math.round((inputWidth * paddingPercent) / 100);
        const paddingY = Math.round((height * paddingPercent) / 100);
  
        let overlayData;

  
        // Convert opacity value from 0-100 to 0-255
        const alphaValue = opacity ? Math.round((opacity * 255) / 100) : 255;
  
        if(type === "text"){
          overlayData = await sharp({
            text: {
              text: `<span foreground="${_textColor}">${text}</span>`,
              // text: text,
              width: inputWidth,
              height: Math.round(height * getFontSize(size)),
              rgba: true,
              align: "center",
              font: getFontName(style),
              fontfile: getFontFile(style),
              wrap: 'none'
            }
          })
          .composite([{
            input: Buffer.from([0,0,0,alphaValue]),
            raw: {
              width: 1,
              height: 1,
              channels: 4,
            },
            tile: true,
            blend: 'dest-in',
          }])
          .png({ quality: 100, force: true, progressive: true})
          // .resize({
          //   width: layout == "grid" ? Math.round((inputWidth / 8)  - (paddingX * 2)) : Math.round(inputWidth - (paddingX * 2)),
          //   // height: Math.round(height * getFontSize(size)),
          //   // height: height,
          //   background: { r: 255, g: 255, b: 255, alpha: 0 },
          //   fit: 'contain',
          //   position: getPosition(position),
          //   withoutEnlargement: true,
          // })
          .extend({
            top: paddingY,
            bottom: paddingY,
            left: paddingX,
            right: paddingX,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toBuffer();
        } else if (type === "image"){
          const logoSrc = await fetch(watermark)
            .then((res) => res.arrayBuffer())
            .then((buffer) => Buffer.from(buffer));
          overlayData = await sharp(logoSrc)
          // .ensureAlpha(alphaValue / 255)
          .resize(layout == 'grid' ? Math.round(((inputWidth * width) / 100) - (paddingX * 2)) : {
            width: Math.round(((inputWidth * width) / 100) - (paddingX * 2)),
            height: Math.round(height - (paddingY * 2)),
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
            position: getPosition(position),
          })
          .composite([{
            input: Buffer.from([0,0,0,alphaValue]),
            raw: {
              width: 1,
              height: 1,
              channels: 4,
            },
            tile: true,
            blend: 'dest-in',
          }])
          .extend({
            top: paddingY,
            bottom: paddingY,
            left: paddingX,
            right: paddingX,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .withMetadata()
          .toBuffer();
        }
  
        if(layout == 'grid' && rotated == 'true'){
          overlayData = await sharp(overlayData)
          .rotate(-45, {
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .toBuffer();
        }
  
        return await inputImage
        .composite([{ input: overlayData, gravity: layout == 'grid' ? 'center' : getPosition(position), tile: layout == 'grid' ? true : false }])
        // .jpeg({ quality: quality || 75, force: false, progressive: true })
        .png({ quality: quality || 75, force: false, progressive: true })
        .toBuffer();
      } catch (error) {
        console.log("error", error);
      }
    };
    return await main();
  } catch(err){
    console.log("generateImage err", err);
  }
}

function getPosition(position){
  switch(position) {
    case 'center':
      return 'center';
    case 'centerRight':
      return 'east';
    case 'centerLeft':
      return 'west';
    case 'topCenter':
      return 'north';
    case 'topRight':
      return 'northeast';
    case 'topLeft':
      return 'northwest';
    case 'bottomCenter':
      return 'south';
    case 'bottomRight':
      return 'southeast';
    case 'bottomLeft':
      return 'southwest';
    default:
      return 'center';
  }
}

function getFontFile(fontStyle){
  // Return the absolute path to the font file
  switch(fontStyle) {
    case 'basic':
      return __dirname + '/fonts/OpenSans-Regular.ttf';
    case 'cursive':
      return __dirname + '/fonts/DancingScript-Regular.ttf';
    case 'print':
      return  __dirname + '/fonts/SpaceMono-Regular.ttf';
    case 'classic':
      return __dirname + '/fonts/ScopeOne-Regular.ttf';
    default:
      return __dirname + '/fonts/OpenSans-Regular.ttf';
  }
}
function getFontName(fontStyle){
  switch(fontStyle) {
    case 'basic':
      return 'Open Sans';
    case 'cursive':
      return 'Dancing Script';
    case 'print':
      return 'Space Mono';
    case 'classic':
      return 'Scope One';
    default:
      return 'Open Sans';
  }
}

function getFontSize(size){
  switch(size) {
    case 'small':
      return 0.03;
    case 'medium':
      return 0.04;
    case 'large':
      return 0.05;
    case 'xlarge':
      return 0.06;
    default:
      return 18;
  }
}

export default generateImage;
