export function bulkQuery(){
  const queryStr = `
  {
    products {
      edges {
        node {
          id
          tags
          title
          vendor
          productType
          featuredMedia {
            ... on MediaImage {
              id
              alt
              preview {
                image {
                  src
                }
              }
            }
          }
          media{
            edges{
              node{
                mediaContentType
                ... on MediaImage {
                  id
                  alt
                  preview {
                    image {
                      src
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`
  return queryStr
}

export function bulkQueryById(productIdList){
  try{
    if (productIdList.length === 0){
      return null
    }
    let queryString = ""
    productIdList.forEach((productId, index) => {
      const productIdValue = productId.replace("gid://shopify/Product/", "")
      if(index === 0){
        queryString = `id:${productIdValue}`
      } else {
        queryString = queryString + ` OR id:${productId}`
      }
    })

    const queryStr = `
    {
      products(query: "${queryString}") {
        edges {
          node {
            id
            tags
            title
            vendor
            productType
            featuredMedia {
              ... on MediaImage {
                id
                alt
                preview {
                  image {
                    src
                  }
                }
              }
            }
            media{
              edges{
                node{
                  mediaContentType
                  ... on MediaImage {
                    id
                    alt
                    preview {
                      image {
                        src
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`

    return queryStr
  } catch(err){
    console.log("err", err);
  }
}

export function bulkQueryByCollection(collectionIdList){
  try {
    if (collectionIdList.length === 0){
      return null
    }
    let queryString = ""
    collectionIdList.forEach((collectionId, index) => {
      const collectionIdValue = collectionId.replace("gid://shopify/Collection/", "")
      if(index === 0){
        queryString = `id:${collectionIdValue}`
      } else {
        queryString = queryString + ` OR id:${collectionId}`
      }
    })
    const queryStr = `
    {
      collections(query: "${queryString}") {
        edges {
          node {
            id
            products {
              edges {
                node {
                  id
                  tags
                  title
                  vendor
                  productType
                  featuredMedia {
                    ... on MediaImage {
                      id
                      alt
                      preview {
                        image {
                          src
                        }
                      }
                    }
                  }
                  media{
                    edges{
                      node{
                        mediaContentType
                        ... on MediaImage {
                          id
                          alt
                          preview {
                            image {
                              src
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `
    return queryStr
  } catch (error) {
    console.log("error", error);
  }
}