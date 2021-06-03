import React, { useState, useEffect, useRef } from "react";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import client from "../apollo-client";

import Head from "next/head";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Router, { withRouter } from "next/router";
import { runRelayer, processData } from "../lib/posts";

import styles from "../styles/index.module.scss";

const first = 10;
// after is cursor from prev page
const delay = true;

// query on load, process data then
// on click of button, query next group and process data

const MIRROR_QUERY = gql`
  query Mirror($first: Int, $after: String) {
    transactions(
      first: $first
      after: $after
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
//
// async function getDataById(posts) {
//   const postList = [];
//
//   for (const transaction of posts) {
//     const postTX = transaction.node.id;
//     const item = await generateMirrorURL(postTX);
//     posts.push(item);
//   }
//
//   return posts;
// }
//

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {}

  return false;
}

export async function getStaticProps() {
  const data = await runRelayer();
  return {
    props: { posts: JSON.stringify(data) },
  };
}

export default function Home({ posts }) {
  const [postlist, setPostlist] = useState(posts);

  async function handleClick(cursor) {
    console.log(`CLICK CURSOR = ${cursor}`);
    const { data } = await client.query({
      query: MIRROR_QUERY,
      variables: {
        first: 5,
        after: cursor,
      },
    });
    const list = await processData(data);
    debugger;
    const originalList = tryParseJSON(postlist)
      ? JSON.parse(postlist)
      : postlist;
    const combined = [...originalList, ...list];
    setPostlist(combined);
    return combined;
  }

  // useEffect(() => setPosts(props.data));
  // const [
  //   mirrorQuery,
  //   { error, data, loading, fetchMore, networkSTATUS },
  // ] = useLazyQuery(MIRROR_QUERY, {
  //   variables: { first, delay },
  //   notifyOnNetworkStatusChange: true,
  // });
  // const nodes = data && data.transactions.edges.map((edge) => edge.node);
  //
  // const postList = getDataById(nodes);
  //
  // const observerRef = useRef(null);
  // const [buttonRef, setButtonRef] = useState(null);
  //
  // useEffect(() => {
  //   const options = {
  //     root: document.querySelector("#list"),
  //     threshold: 0.1,
  //   };
  //   observerRef.current = new IntersectionObserver((entries) => {
  //     const entry = entries[0];
  //     if (entry.isIntersecting) {
  //       entry.target.click();
  //     }
  //   }, options);
  // }, []);
  //
  // useEffect(() => {
  //   if (buttonRef) {
  //     observerRef.current.observe(document.querySelector("#buttonLoadMore"));
  //   }
  // }, [buttonRef]);
  //
  // if (error) {
  //   console.log(error);
  //   return <div>Error</div>;
  // }
  //
  // //
  // // if (networkStatus === 1) {
  // //   return <div>Loading...</div>;
  // // }
  // //
  // // const isRefetching = networkStatus === 3;
  //
  console.log(`POSTS: ${postlist}`);
  const parsedList = tryParseJSON(postlist) ? JSON.parse(postlist) : postlist;
  debugger;
  const cursor = parsedList[parsedList.length - 1].cursor;
  console.log(`CURSOR = ${cursor}`);
  // console.log(postList);
  return (
    <div>
      <div className="container">
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div id="list">
            <ul>
              {parsedList.map((post) => (
                <li>{post.title}</li>
              ))}
            </ul>
          </div>
          <div className={styles.row}>
            <div
              className={styles.btn}
              size="mini"
              id="buttonLoadMore"
              onClick={() => handleClick(cursor)}
            >
              load more
            </div>
          </div>
        </main>

        <footer>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{" "}
            <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
          </a>
        </footer>
      </div>
    </div>
  );
}
