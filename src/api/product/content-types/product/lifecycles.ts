module.exports = {
  beforeCreate: async ({params}) => {
    const adminUserId = params.data.createdBy;
    // console.log('adminUserId', params);


    // @ts-ignore
    const author = (await strapi.entityService.findMany("api::author.author", {
      filters: {
        //@ts-ignore
        admin_user: [adminUserId]
      }
    }))[0];

    if (author) {
      params.data.authors.connect = [...params.data.authors.connect, author.id];
    }
  }
}
