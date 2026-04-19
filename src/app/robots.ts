import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots  => {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: "https://coc.gamerdex.app/sitemap.xml",
	};
}
export default robots;
