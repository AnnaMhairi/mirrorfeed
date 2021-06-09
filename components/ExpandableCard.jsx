import React, { useState } from "react";
import truncate from "lodash/truncate";
import Card from "@material-ui/core/Card";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import styles from "../styles/index.module.scss";

function ExpandableCard(data) {
  const [expanded, setExpanded] = useState(false);
  const post = data.post;
  const title = post.title;
  const publication = post.publication;
  const body = post.body;
  const url = post.url;

  return (
    <Card className={styles.card} variant="outlined">
      <Typography>
        <Link href={url}>
          <h3 className={styles.cardTitle}>{title}</h3>
        </Link>
        <h4 className={styles.publishedBy}>Published by {publication}</h4>
        {!expanded && (
          <div>
            <div>{truncate(body)}</div>

            <button onClick={() => setExpanded(true)}>+</button>
          </div>
        )}
        {expanded && (
          <div>
            <div>{body}</div>
            <button onClick={() => setExpanded(false)}>-</button>
          </div>
        )}
      </Typography>
    </Card>
  );
}

export default ExpandableCard;
