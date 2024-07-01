/**
 * product service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::product.product', ({strapi}) => ({
  async findPublic(query: any) {
    const newQuery = {
      ...query,
      filters: {
        ...query.filters,
        primary: false
      }
    };

    //@ts-ignore
    return await strapi.entityService.findMany("api::product.product", this.getFetchParams(newQuery));
  },

  // async findPublicOne(id: number, params = {}) {
  //   const product = await strapi.service("api::product.product").findOne(id);
  //
  //   if (product.primary == true) return ctx.forbidden('You do not have access to this product');
  //
  //   const sanitizedProduct = await this.sanitizeOutput(product, ctx);
  //
  //   return this.transformResponse(sanitizedProduct);
  // }

  async findOneIfPublic(args) {
    const {id, query} = args;

    //@ts-ignore
    const post = await strapi.entityService.findOne("api::product.product", id, this.getFetchParams(query));

    return post.primary ? null : post;
  },

  async likeProduct(args) {
    const {productId, userId, query} = args;


    const productToLike: any = await strapi.entityService.findOne("api::product.product", productId,
      {
        //@ts-ignore
      populate: ["likedBy"],
    });

    const updatedProduct = await strapi.entityService.update("api::product.product", productId, {
      data: {
        likedBy: [...productToLike.likedBy, userId]
      },
      ...query
    });

    console.log('sanitizedProduct', updatedProduct);


    return updatedProduct;
  }

}));

