import React from "react";
import { getPosts, getAuthor } from "../../services/api";
import WordPressBlockRenderer from "../../services/blockRenderer";
import Link from "next/link";
import HorizontalScrollSections from "../../components/HorizontalScrollSections";

const blockRenderer = new WordPressBlockRenderer();

// Define types for better type safety
type Post = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  author: number;
};

type Author = {
  name: string;
  avatar_urls: { [size: string]: string };
};

type PostPageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function PostPage({ params }: PostPageProps) {
  const { id } = params;

  // Fetch the post by ID
  const posts: Post[] = await getPosts();
  const post = posts.find((p) => String(p.id) === String(id));

  if (!post) {
    return <div>Post not found</div>;
  }

  let author: Author | null = null;
  try {
    author = await getAuthor(post.author);
  } catch (e) {
    console.error("Failed to fetch author:", e);
  }

  // Define the type for blocks (adjust based on WordPressBlockRenderer output)
  type Block = React.ReactNode; // Replace with actual block type if known
  const blocks: Block[] = blockRenderer.renderBlocks(post.content.rendered);

  return (
    <div className="single-post-page">
      <div className="post-details">
        <div className="post-author">
          {author && author.avatar_urls && author.avatar_urls["48"] ? (
            <>
              <img
                src={author.avatar_urls["48"]}
                alt={`Avatar of ${author.name || "Unknown"}`}
              />
              <p>{author.name || "Unknown"}</p>
            </>
          ) : (
            <p>Unknown</p>
          )}
        </div>
        <div>
          <h2>{post.title.rendered}</h2>
          <p>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href="/">
          <span style={{ fontSize: "1.2rem", color: "#0070f3" }}>
            ← Back to Home
          </span>
        </Link>
      </div>
      <div className="post-content">
        <HorizontalScrollSections>{blocks}</HorizontalScrollSections>
      </div>
    </div>
  );
}
