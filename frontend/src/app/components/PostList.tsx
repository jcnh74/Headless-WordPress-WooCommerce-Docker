"use client";
import React, { useState, useEffect, useRef } from "react";
import { getPosts, getAuthor, Post, Author } from "../services/api";
import WordPressBlockRenderer from "../services/blockRenderer";
import HorizontalScrollSections from "./HorizontalScrollSections";
import Link from "next/link";

const blockRenderer = new WordPressBlockRenderer();

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<{ [id: number]: Author | null }>({});
  const sliderRefs = useRef<React.RefObject<any>[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
        const authorIds = Array.from(new Set(data.map((post) => post.author)));
        const authorData: { [id: number]: Author | null } = {};
        await Promise.all(
          authorIds.map(async (id) => {
            try {
              const author = await getAuthor(id);
              authorData[id] = author;
            } catch (e) {
              authorData[id] = null;
            }
          })
        );
        setAuthors(authorData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Sort posts by date descending
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestPost = sortedPosts[0];
  const previousPosts = sortedPosts.slice(1);

  let latestBlocks: React.ReactNode[] = [];
  if (latestPost) {
    latestBlocks = blockRenderer.renderBlocks(latestPost.content.rendered);
  }

  return (
    <div className="post-list">
      {/* Latest post section */}
      <div className="post-details">
        <div className="post-author">
          {latestPost &&
          authors[latestPost.author] &&
          authors[latestPost.author]?.avatar_urls &&
          authors[latestPost.author]?.avatar_urls["48"] ? (
            <>
              <img
                src={authors[latestPost.author]?.avatar_urls["48"]}
                alt={`Avatar of ${
                  authors[latestPost.author]?.name || "Unknown"
                }`}
              />
              <p>{authors[latestPost.author]?.name || "Unknown"}</p>
            </>
          ) : (
            <p>Unknown</p>
          )}
        </div>
        <div>
          <h2>{latestPost?.title.rendered}</h2>
          <p>
            {latestPost &&
              new Date(latestPost.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
          </p>
        </div>
        <h2>&rarr;</h2>
      </div>
      <div className="post-blocks">
        <section className="section-latest-post">
          <div className="post-content">
            <HorizontalScrollSections>
              {latestBlocks}
              {/* Final section: links to previous posts */}
              <section className="section-previous-posts">
                <h2>Previous Posts</h2>
                <ul>
                  {previousPosts.map((post) => (
                    <li key={post.id}>
                      <Link href={`/posts/${post.id}`}>
                        {post.title.rendered}
                        <span>
                          (
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          )
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </HorizontalScrollSections>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostList;
