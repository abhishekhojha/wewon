"use client";
import { Metadata } from "next";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ChoiceFillingForm from "@/components/choice-filling/ChoiceFillingForm";
import MainHeading from "@/components/sections/MainHeading";
import {
  ChoiceFillingProduct,
  fetchChoiceFillingProductBySlug,
  resolveChoiceFillingToolKey,
} from "@/network/choice-filling";

// export const metadata: Metadata = {
//   title: "Choice Filling Product Details | We Won Academy",
//   description:
//     "View detailed information about choice-filling products before using the tool.",
// };
interface Labels {
  [slug: string]: {
    heading: string;
    subHeading: string;
    formHeading: string;
    capsule: string;
    colleges: string[];
  }
}
export default function ChoiceFillingProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = useMemo(() => params.slug as string, [params.slug]);

  const [product, setProduct] = useState<ChoiceFillingProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChoiceFillingProductBySlug(slug);
        setProduct(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading choice-filling tool...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold">
            {error || "Product not found"}
          </p>
          {/* <Link
            href="/choice-filling"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#0f3a67] text-white"
          >
            Back To Choice-Filling
          </Link> */}
        </div>
      </div>
    );
  }

  const resolvedToolKey = resolveChoiceFillingToolKey(product);
  const toolLabel =  product.title || "Choice Filling";
  const labels : Labels ={
    "iit" : {heading : "Personalised IIT Choice Filling" ,subHeading : "", formHeading : "Generate a personalised IIT choice list based on your rank", capsule :"IIT" , colleges : ["IIT"]},
    "jee-main" : {heading : "Personalised NIT, IIIT & GFTI Choice Filling" ,subHeading : "", formHeading : "Generate a personalised JOSAA choice list based on your rank", capsule : "NIT • IIIT • GFTI" , colleges : ["NIT","IIIT","GFTI"]},
    "jac-delhi" : {heading : "Personalised DTU, NSUT, IIIT-D, DSEU & IGDTUW Choice Filling" ,subHeading : "", formHeading : " Generate a personalised JAC Delhi choice list based on your rank", capsule : "DTU • NSUT • IIIT-D • IGDTUW • DSEU" , colleges : ["DTU","NSUT","IIIT-D","IGDTUW","DSEU"]},
    "uptac" : {heading : "Personalised UPTAC/AKTU Choice Filling" ,subHeading : "", formHeading : "Generate a personalised UPTAC/AKTU choice list based on your rank", capsule : "UPTAC • AKTU • UPTU" , colleges : ["UPTAC","AKTU","UPTU"]},
    "csab" : {heading : "Personalised CSAB Special Round Choice Filling" ,subHeading : "", formHeading : "Generate a personalised CSAB choice list based on your rank", capsule : "NIT • IIIT • GFTI • CSAB" , colleges : ["NIT","IIIT","GFTI"]}
  }
  const toolDescription =  labels[resolvedToolKey as keyof typeof labels]?.formHeading || resolvedToolKey.toUpperCase() + " Choice Filling";
  const toolCapsule =  labels[resolvedToolKey as keyof typeof labels]?.capsule || "Powered by real cutoff data";
  return (
    <>
      <div className="container mx-auto mb-8 px-4">
        {/* <div className="mb-6 mt-6">
          <Link
            href={`/choice-filling`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f3a67] hover:text-[#0a2847]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Choice-Filling
          </Link>
        </div> */}
        <MainHeading top={toolLabel}  />
      </div>

      <div className="container mx-auto px-4">
        <ChoiceFillingForm
          toolKey={resolvedToolKey}
          toolDescription={toolDescription}
          labels={labels[resolvedToolKey as keyof typeof labels]}
          capsule={toolCapsule}
          product={product}
          productId={product._id}
          productSlug={product.slug}
        />
      </div>
    </>
  );
}

