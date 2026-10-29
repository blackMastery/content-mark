// Bundled, reviewed portfolio assets are allowed alongside authenticated media uploads.
export const bundledProjectImages = {
  poshhomedecor: {
    src: "/portfolio/poshhomedecor.webp",
    width: 1200,
    height: 675,
  },
  wsengineering: {
    src: "/portfolio/wsengineering.webp",
    width: 1200,
    height: 675,
  },
  inneralchemyinstitution: {
    src: "/portfolio/inneralchemyinstitution.webp",
    width: 1200,
    height: 675,
  },
  waronretailguyana: {
    src: "/portfolio/waronretailguyana.webp",
    width: 1200,
    height: 514,
  },
  mistaconciergetravel: {
    src: "/portfolio/mistaconciergetravel.webp",
    width: 1200,
    height: 567,
  },
  "impact-business-solutions": {
    src: "/portfolio/impact-business-solutions.webp",
    width: 1200,
    height: 645,
  },
  healthyzway: { src: "/portfolio/healthyzway.webp", width: 1200, height: 650 },
  selenafurniturestore: {
    src: "/portfolio/selenafurniturestore.webp",
    width: 1200,
    height: 586,
  },
  bucketlistcaribbean: {
    src: "/portfolio/bucketlistcaribbean.webp",
    width: 1200,
    height: 581,
  },
} as const;

export function getBundledProjectImage(url: string) {
  return Object.values(bundledProjectImages).find((image) => image.src === url);
}

export function isBundledProjectImage(url: string) {
  return Boolean(getBundledProjectImage(url));
}

export function isAllowedProjectImage(url: string, storageUrl?: string) {
  return (
    !url ||
    isBundledProjectImage(url) ||
    Boolean(
      storageUrl &&
      url.startsWith(`${storageUrl}/storage/v1/object/public/site-media/`),
    )
  );
}
