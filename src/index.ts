export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");
    const extension = () => ({
      typeDefs: `
        type Mutation {
          likeProduct(id: ID!): ProductEntityResponse
        }
      `,
      resolvers: {
        Mutation: {
          likeProduct: async (parent, args, ctx, info) => {
            console.log('mutation args', args);

            const {id: productId} = args;
            const userId = ctx.state.user.id;
            const likedProduct = await strapi
              .service("api::product.product")
              .likeProduct({productId, userId});

            console.log('wtf??? liked product', likedProduct);

            const { toEntityResponse } = strapi.plugin("graphql").service("format").returnTypes;
            const formattedResponse = toEntityResponse(likedProduct, {
              args,
              resourceUID: "api::product.product"
            });

            console.log('mutation formatted response', formattedResponse);


            return formattedResponse;
          }
        }
      },
      resolversConfig: {
        "Mutation.likeProduct": {
          auth: {
            scope: ["api::product.product.likeProduct"]
          }
        }
      }
    });

    extensionService.use(extension);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: "admin::user",
      afterCreate: async ({result}) => {
        const {id, firstname, lastname, email, username, createdAt, updatedAt} = result;

        await strapi.service("api::author.author")
          .create({
            data: {firstname, lastname, email, username, createdAt, updatedAt, admin_user: [id]}
          });
      },
      afterUpdate: async ({ result }) => {

        // const correspondAuthor = (await strapi.entityService.findMany("api::author.author", {
        //   populate: ['admin_user'],
        //   filters: {
        //     admin_user: {
        //       id: result.id
        //     }
        //   }
        // }))[0];

        const correspondAuthor = (await strapi.entityService.findMany("api::author.author", {
          filters: {
            admin_user: [result.id]
          }
        }))[0];

        // console.log('result.id', result.id);

        const {firstname, lastname, email, username, updatedAt} = result;

        if (correspondAuthor) {
          await strapi.service("api::author.author").update(correspondAuthor.id, {
            data: {firstname, lastname, email, username, updatedAt}
          })
        }
      }
    });
  },
};
