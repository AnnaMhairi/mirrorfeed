// export async function getStaticPaths() {
//   // query Strapi to calculate the total page number
//   return {
//     paths: [
//       { params: { page: "1" } },
//       { params: { page: "2" } },
//       { params: { page: "3" } },
//     ],
//     fallback: true, // See the "fallback" section in docs
//   };
// }
//
// export async function getStaticProps(context) {
//   const { page } = context.params;
//   // fetch page data
//   return {
//     props: {},
//   };
// }
