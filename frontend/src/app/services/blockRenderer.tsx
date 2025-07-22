import React from "react";
import { parse as wpParse } from "@wordpress/block-serialization-default-parser";
import parse from "html-react-parser";
import sanitizeHtml from "sanitize-html";

export interface WPBlock {
  blockName: string | null;
  attrs?: Record<string, any>;
  innerHTML?: string;
  innerBlocks?: WPBlock[];
}

export class WordPressBlockRenderer {
  customComponents: Record<string, React.ComponentType<any>>;
  allowedTags: Record<string, string[]>;

  constructor(customComponents: Record<string, React.ComponentType<any>> = {}) {
    this.customComponents = customComponents;
    this.allowedTags = {
      p: ["class", "style"],
      h1: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      h5: ["class", "style"],
      h6: ["class", "style"],
      img: ["src", "alt", "width", "height", "class"],
      figure: ["class"],
      figcaption: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
      blockquote: ["class", "cite"],
      a: ["href", "target", "rel", "class"],
      strong: ["class"],
      em: ["class"],
      span: ["class", "style"],
      div: ["class", "style"],
    };
  }

  parseBlocks(content: string): WPBlock[] {
    try {
      if (typeof content !== "string" || !content.includes("<!-- wp:")) {
        return [{ blockName: null, innerHTML: content }];
      }
      const blocks = wpParse(content);
      return Array.isArray(blocks) ? (blocks as WPBlock[]) : [];
    } catch (error) {
      console.error("Error parsing blocks:", error);
      return [];
    }
  }

  sanitizeContent(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: Object.keys(this.allowedTags),
      allowedAttributes: this.allowedTags,
      allowedSchemes: ["http", "https", "mailto"],
      transformTags: {
        script: "div",
        style: "div",
      },
      parseStyleAttributes: false,
    });
  }

  renderBlocks(content: string): React.ReactNode[] {
    const blocks = this.parseBlocks(content);
    return blocks.map((block, index) => this.renderBlock(block, index));
  }

  renderBlock(block: WPBlock, index: number): React.ReactNode {
    const { blockName, attrs = {}, innerHTML = "", innerBlocks = [] } = block;
    if (this.customComponents[blockName || ""]) {
      const CustomComponent = this.customComponents[blockName || ""];
      return (
        <CustomComponent
          key={index}
          attrs={attrs}
          innerHTML={innerHTML}
          innerBlocks={innerBlocks}
          renderer={this}
        />
      );
    }
    switch (blockName) {
      case "core/paragraph":
        return this.renderParagraph(attrs, innerHTML, index);
      case "core/heading":
        return this.renderHeading(attrs, innerHTML, index);
      case "core/image":
        return this.renderImage(attrs, innerHTML, index);
      case "core/list":
        return this.renderList(attrs, innerHTML, index);
      case "core/quote":
        return this.renderQuote(attrs, innerHTML, index);
      case "core/columns":
        return this.renderColumns(attrs, innerBlocks, index);
      case "core/column":
        return this.renderColumn(attrs, innerBlocks, index);
      case "core/group":
        return this.renderGroup(attrs, innerBlocks, index);
      case "core/media-text":
        return this.renderMediaText(attrs, innerBlocks, index);
      case "core/gallery":
        return this.renderGallery(attrs, innerHTML, index);
      case "core/embed":
        return this.renderEmbed(attrs, innerHTML, index);
      case "core/cover":
        return this.renderCover(attrs, innerHTML, index);
      case null:
        return this.renderHTML(innerHTML, index);
      default:
        return this.renderGenericBlock(
          blockName,
          attrs,
          innerHTML,
          innerBlocks,
          index
        );
    }
  }

  renderParagraph(attrs: any, innerHTML: string, index: number) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <p
        key={index}
        className={attrs.className || ""}
        style={{
          textAlign: attrs.align || "left",
          fontSize: attrs.fontSize || "inherit",
          color: attrs.textColor || "inherit",
          backgroundColor: attrs.backgroundColor || "transparent",
        }}
      >
        {parse(cleanHTML)}
      </p>
    );
  }

  renderHeading(attrs: any, innerHTML: string, index: number) {
    const level = attrs.level || 2;
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    const cleanHTML = this.sanitizeContent(innerHTML);
    return React.createElement(
      Tag,
      {
        key: index,
        className: attrs.className || "",
        style: {
          textAlign: attrs.textAlign || "left",
          color: attrs.textColor || "inherit",
        },
      },
      parse(cleanHTML)
    );
  }

  renderImage(attrs: any, innerHTML: string, index: number) {
    return (
      <figure key={index} className={`wp-block-image ${attrs.className || ""}`}>
        <img
          src={attrs.url}
          alt={attrs.alt || ""}
          width={attrs.width}
          height={attrs.height}
          style={{
            objectFit: attrs.scale || "cover",
          }}
        />
        {attrs.caption && (
          <figcaption>{parse(this.sanitizeContent(attrs.caption))}</figcaption>
        )}
      </figure>
    );
  }

  renderList(attrs: any, innerHTML: string, index: number) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    const isOrdered = attrs.ordered || innerHTML.includes("<ol");
    const Tag = isOrdered ? "ol" : "ul";
    return React.createElement(
      Tag,
      {
        key: index,
        className: attrs.className || "",
        start: attrs.start || undefined,
      },
      parse(cleanHTML)
    );
  }

  renderQuote(attrs: any, innerHTML: string, index: number) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <blockquote
        key={index}
        className={`wp-block-quote ${attrs.className || ""}`}
        cite={attrs.citation}
      >
        {parse(cleanHTML)}
      </blockquote>
    );
  }

  renderColumns(attrs: any, innerBlocks: WPBlock[], index: number) {
    return (
      <div key={index} className={`wp-block-columns ${attrs.className || ""}`}>
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, Number(`${index}${blockIndex}`))
        )}
      </div>
    );
  }

  renderColumn(attrs: any, innerBlocks: WPBlock[], index: number) {
    return (
      <div
        key={index}
        className={`wp-block-column ${attrs.className || ""}`}
        style={{ flexBasis: attrs.width || "auto" }}
      >
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, Number(`${index}${blockIndex}`))
        )}
      </div>
    );
  }

  renderGroup(attrs: any, innerBlocks: WPBlock[], index: number) {
    return (
      <div
        key={index}
        className={`wp-block-group ${attrs.className || ""}`}
        style={{
          backgroundColor: attrs.backgroundColor || "transparent",
          color: attrs.textColor || "inherit",
        }}
      >
        {innerBlocks.map((block, blockIndex) =>
          this.renderBlock(block, Number(`${index}${blockIndex}`))
        )}
      </div>
    );
  }

  renderMediaText(attrs: any, innerBlocks: WPBlock[], index: number) {
    return (
      <div
        key={index}
        className={`wp-block-media-text ${attrs.className || ""}`}
      >
        {attrs.mediaUrl && (
          <figure className="wp-block-media-text__media">
            {attrs.mediaType === "video" ? (
              <video src={attrs.mediaUrl} controls />
            ) : (
              <img src={attrs.mediaUrl} alt={attrs.mediaAlt || ""} />
            )}
          </figure>
        )}
        <div className="wp-block-media-text__content">
          {innerBlocks.map((block, blockIndex) =>
            this.renderBlock(block, Number(`${index}${blockIndex}`))
          )}
        </div>
      </div>
    );
  }

  renderGallery(attrs: any, innerHTML: string, index: number) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <figure
        key={index}
        className={`wp-block-gallery ${attrs.className || ""}`}
      >
        {parse(cleanHTML)}
      </figure>
    );
  }

  renderEmbed(attrs: any, innerHTML: string, index: number) {
    if (attrs.providerNameSlug === "youtube") {
      return this.renderYouTubeEmbed(attrs, index);
    }
    if (attrs.providerNameSlug === "twitter") {
      return this.renderTwitterEmbed(attrs, index);
    }
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <div key={index} className={`wp-block-embed ${attrs.className || ""}`}>
        {parse(cleanHTML)}
      </div>
    );
  }

  renderYouTubeEmbed(attrs: any, index: number) {
    const videoId = this.extractYouTubeId(attrs.url);
    if (!videoId) return null;
    return (
      <div key={index} className="wp-block-embed wp-block-embed-youtube">
        <div className="responsive-embed">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder={"0"}
            allowFullScreen
            loading="lazy"
            title="YouTube video"
          />
        </div>
      </div>
    );
  }

  renderTwitterEmbed(attrs: any, index: number) {
    return (
      <div key={index} className="wp-block-embed wp-block-embed-twitter">
        <blockquote className="twitter-tweet">
          <a href={attrs.url}>View Tweet</a>
        </blockquote>
      </div>
    );
  }

  renderHTML(innerHTML: string, index: number) {
    let cleanHTML = this.sanitizeContent(innerHTML);
    cleanHTML = cleanHTML.replace(/\n/g, "");
    return parse(cleanHTML);
  }

  renderGenericBlock(
    blockName: string | null,
    attrs: any,
    innerHTML: string,
    innerBlocks: WPBlock[],
    index: number
  ) {
    const cleanHTML = this.sanitizeContent(innerHTML);
    return (
      <div
        key={index}
        className={`wp-block ${blockName?.replace("/", "-")} ${
          attrs.className || ""
        }`}
        data-block-type={blockName || undefined}
      >
        {innerHTML && parse(cleanHTML)}
        {innerBlocks.length > 0 &&
          innerBlocks.map((block, blockIndex) =>
            this.renderBlock(block, Number(`${index}${blockIndex}`))
          )}
      </div>
    );
  }

  extractYouTubeId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }

  addCustomComponent(blockName: string, component: React.ComponentType<any>) {
    this.customComponents[blockName] = component;
  }

  updateAllowedTags(tags: Record<string, string[]>) {
    this.allowedTags = { ...this.allowedTags, ...tags };
  }
}

export default WordPressBlockRenderer;
