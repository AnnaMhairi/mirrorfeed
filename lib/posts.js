import Arweave from "arweave";
import { gql } from "@apollo/client";
import client from "../apollo-client";

// Initialize arweave
const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const MIRROR_QUERY = gql`
  query Mirror($after: String) {
    transactions(
      first: 5
      after: $after
      sort: HEIGHT_ASC
      owners: ["Ky1c1Kkt-jZ9sY1hvLF5nCf6WWdBhIU5Un_BMYh-t3c"]
      tags: [{ name: "App-Name", values: ["MirrorXYZ"] }]
    ) {
      edges {
        cursor
        node {
          id
        }
      }
    }
  }
`;

// Constants
const MIRROR_ADDRESS = "Ky1c1Kkt-jZ9sY1hvLF5nCf6WWdBhIU5Un_BMYh-t3c";
const MIRROR_TXIDS = {
  op: "and",
  expr1: {
    op: "equals",
    expr1: "from",
    expr2: MIRROR_ADDRESS,
  },
  expr2: {
    op: "equals",
    expr1: "App-Name",
    expr2: "MirrorXYZ",
  },
};

export async function processData(data) {
  const transactions = data.transactions.edges;
  const count = transactions.length;
  const cursor = transactions[count - 1].cursor;
  const posts = [];
  for (const postTX of transactions) {
    const item = await generateMirrorURL(postTX.node.id, cursor);
    posts.push(item);
  }
  return posts;
}

export async function runRelayer() {
  const { data } = await client.query({
    query: MIRROR_QUERY,
  });

  const transactions = data.transactions.edges;
  const cursor = transactions[transactions.length - 1].cursor;
  const posts = [];

  for (const postTX of transactions) {
    const item = await generateMirrorURL(postTX.node.id, cursor);
    posts.push(item);
  }
  return posts;
}

export async function generateMirrorURL(txID, cursor) {
  // Collect raw transaction data from ID
  const rawTransactionData = await arweave.transactions.getData(txID, {
    decode: true,
    string: true,
  });
  // JSON parse transaction data
  const parsedTransactionData = JSON.parse(rawTransactionData);
  // Collect publication + digest
  const publication = parsedTransactionData.content.publication;
  const title = parsedTransactionData.content.title;
  const body = parsedTransactionData.content.body;
  const digest = parsedTransactionData.originalDigest;
  // Return publication.mirror.xyz/digest format url
  return {
    cursor: cursor,
    publication: publication,
    digest: digest,
    title: title,
    body: body,
    url: `https://${publication}.mirror.xyz/${digest}`,
  };
}

// Run relayer on initial push
// runRelayer();

// Run relayer every hour
// setInterval(() => {
//   runRelayer();
// }, 60 * 60 * 1000);
