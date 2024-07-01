module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/products/:id/like",
      handler: "api::product.product.likeProduct",
    }
  ]
}
