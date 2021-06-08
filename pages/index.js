import React, { useState, useEffect, useRef } from "react";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import client from "../apollo-client";

import Head from "next/head";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Router, { withRouter } from "next/router";
import { runRelayer, processData } from "../lib/posts";

import styles from "../styles/index.module.scss";

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
  const parsed = tryParseJSON(postlist) ? JSON.parse(postlist) : postlist;
  const [parsedList, setParsedList] = useState(parsed);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const cursor = parsedList[parsedList.length - 1].cursor;
    if (cursor) {
      setLoading(true);
      const { data } = await client.query({
        query: MIRROR_QUERY,
        variables: {
          after: cursor,
        },
      });
      // fetch new posts
      const list = await processData(data);
      setLoading(false);
      // add new posts to existing list
      const combined = [...parsedList, ...list];
      // updated parsedList
      setParsedList(combined);
      return combined;
    }
  }

  return (
    <div>
      <div className="container">
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <div>{loading && `Loading...`}</div>
          <div id="list">
            <ul>
              {parsedList.map((post) => (
                <li>{post.title}</li>
              ))}
            </ul>
          </div>
          <div className={styles.row}>
            <button
              className={styles.btn}
              disabled={loading}
              size="mini"
              id="buttonLoadMore"
              onClick={() => handleClick()}
            >
              Load more
            </button>
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
