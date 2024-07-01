/**
 * product controller
 */

import { factories } from '@strapi/strapi'
import {Property} from "csstype";
import Content = Property.Content;

export default factories.createCoreController('api::product.product', ({strapi}) => ({
  // async find(ctx: any) {
  //   const isRequestingNonPrimary = ctx.query.filters && ctx.query.filters.primary == "false"
  //
  //   if (ctx.state.user || isRequestingNonPrimary) return await super.find(ctx);
  //
  //   const {query} = ctx;
  //
  //   const filteredPosts = await strapi.service("api::product.product").find({
  //     ...query,
  //     filters: {
  //       ...query.filters,
  //       primary: false
  //     }
  //   })
  //
  //   const sanitizedPosts = await this.sanitizeOutput(filteredPosts, ctx);
  //   return this.transformResponse(sanitizedPosts);
  // }

  async find(ctx: any) {
      const isRequestingNonPrimary = ctx.query.filters && ctx.query.filters.primary == "false"

      if (ctx.state.user || isRequestingNonPrimary) return await super.find(ctx);

      const publicProducts = await strapi.service("api::product.product").findPublic(ctx.query);
      const sanitizedProducts = await this.sanitizeOutput(publicProducts, ctx)
      return this.transformResponse(sanitizedProducts);
  },

  // async findOne(ctx) {
  //   if (ctx.state.user) return await super.findOne(ctx);
  //
  //   const {id} = ctx.params;
  //
  //   const product = await strapi.service("api::product.product").findOne(id);
  //
  //   if (product.primary == true) return ctx.forbidden('You do not have access to this product');
  //
  //   const sanitizedProduct = await this.sanitizeOutput(product, ctx);
  //
  //   return this.transformResponse(sanitizedProduct);
  // }

  // async findOne(ctx) {
  //   if (ctx.state.user) return await super.findOne(ctx);
  //
  //   const {id} = ctx.params;
  //
  //   const product = await strapi.service("api::product.product").findOne(id);
  //
  //   if (product.primary == true) return ctx.forbidden('You do not have access to this product');
  //
  //   const sanitizedProduct = await this.sanitizeOutput(product, ctx);
  //
  //   return this.transformResponse(sanitizedProduct);
  // }

  async findOne(ctx) {
    if (ctx.state.user) return await super.findOne(ctx);

    const {id} = ctx.params;
    const {query} = ctx;

    const publicIfFound = await strapi.service("api::product.product").findOneIfPublic({id, query});

    const sanitizedProduct = await this.sanitizeOutput(publicIfFound, ctx);

    return this.transformResponse(sanitizedProduct);
  },

  async likeProduct(ctx) {
    console.log('controller product');
    const user = ctx.state.user;
    const productId = ctx.params.id;
    const { query} = ctx;

    const updatedProduct = await strapi.service("api::product.product").likeProduct({
      productId, userId: user.id, query
    });

    const sanitizedProduct = await this.sanitizeOutput(updatedProduct, ctx);
    return this.transformResponse(sanitizedProduct);
  }
}));
