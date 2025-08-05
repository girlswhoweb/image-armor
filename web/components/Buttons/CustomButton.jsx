import './CustomButton.css';
import {
  Icon,
  Spinner
} from "@shopify/polaris";

function CustomButton({ loading= false, icon, variant = 'primary', size = 'medium', color, disabled, ...rest }) {
  // Compose class names based on variant and size
  const classes = `custom-button custom-button--${variant} custom-button--${size}`;
  // Inline style for dynamic color: use CSS variable
  const style = color ? { '--button-color': color } : {};
  return (
    <button
      className={classes} 
      style={style} 
      disabled={disabled} 
      {...rest}
    >
      {loading ? (
        <Spinner size="small" />
      ) : (
        icon && <Icon source={icon} />
      )}
      {rest.children}
    </button>
  );
}

export default CustomButton;
