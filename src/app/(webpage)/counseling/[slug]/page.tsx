import { Metadata } from "next";
import CounselingClient from "./CounselingClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://wewon-backend.vercel.app/";

  try {
    const response = await fetch(`${apiUrl}api/admin/products/slug/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("API did not return JSON");
    }

    const data = await response.json();

    if (data.success && data.data) {
      const product = data.data;
      return {
        title: `${product.title} - Online Counseling & Mentorship Program`,
        description:
          product.description ||
          `Join the ${product.title} on We Won Academy. Get expert mentorship, choice filling tools, and comprehensive guidance for engineering admissions.`,
        openGraph: {
          title: `${product.title} | We Won Academy`,
          description: product.description,
          images: [product.thumbnail || "/og-image.png"],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching counseling product for metadata:", error);
  }

  return {
    title: "Counseling Program | We Won Academy",
    description:
      "Expert counseling and mentorship programs for engineering admissions.",
  };
}

export default function Page() {
  return <CounselingClient />;
}
