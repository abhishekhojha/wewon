import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: rawId } = await params;
    const id = rawId.replace(".xml", "");
    const baseUrl = "https://www.wewonacademy.com";
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://wewon-backend.vercel.app/";

    let urls: { url: string; lastModified: Date; changeFrequency: string; priority: number }[] = [];

    // Static pages
    if (id === "static") {
        const staticRoutes = [
            "",
            "/about",
            "/contact",
            "/counseling",
            "/mentorship",
            "/predictor",
            "/percentile",
            "/colleges",
            "/exams",
            "/privacy",
            "/terms",
            "/refund",
            "/jee-mains-predictor",
            "/josaa-predictor",
            "/csab-predictor",
            "/jee-advanced-predictor",
            "/jee-early-predictor",
            "/uptac-predictor",
            "/hbtu-predictor",
            "/mmmut-predictor",
            "/jac-delhi-predictor",
            "/jac-chandigarh-predictor",
        ];

        urls = staticRoutes.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: route === "" ? "daily" : "weekly",
            priority: route === "" ? 1 : 0.8,
        }));
    }
    // Dynamic College pages
    else if (id === "colleges") {
        try {
            const collegesRes = await fetch(`${apiUrl}api/colleges?limit=1000`);
            const collegesData = await collegesRes.json();
            if (collegesData.success && Array.isArray(collegesData.data)) {
                urls = collegesData.data.reduce((acc: any[], college: any) => {
                    // Main college page
                    acc.push({
                        url: `${baseUrl}/colleges/${college.slug}`,
                        lastModified: new Date(college.updatedAt || new Date()),
                        changeFrequency: "weekly",
                        priority: 0.7,
                    });
                    // Cutoff page
                    acc.push({
                        url: `${baseUrl}/colleges/${college.slug}/cutoffs`,
                        lastModified: new Date(college.updatedAt || new Date()),
                        changeFrequency: "monthly",
                        priority: 0.6,
                    });
                    return acc;
                }, []);
            }
        } catch (error) {
            console.error("Error fetching colleges for sitemap:", error);
        }
    }
    // Dynamic Exam pages
    else if (id === "exams") {
        try {
            const examsRes = await fetch(`${apiUrl}api/exams?limit=1000`);
            const examsData = await examsRes.json();
            if (Array.isArray(examsData.data)) {
                urls = examsData.data.map((exam: any) => ({
                    url: `${baseUrl}/exams/${exam._id}`,
                    lastModified: new Date(exam.createdAt || new Date()),
                    changeFrequency: "monthly",
                    priority: 0.6,
                }));
            }
        } catch (error) {
            console.error("Error fetching exams for sitemap:", error);
        }
    }
    // Dynamic Counseling pages
    else if (id === "counseling") {
        try {
            const counselingRes = await fetch(`${apiUrl}api/counseling?limit=1000`);
            const counselingData = await counselingRes.json();
            if (counselingData.success && Array.isArray(counselingData.data)) {
                urls = counselingData.data.map((product: any) => ({
                    url: `${baseUrl}/counseling/${product.slug}`,
                    lastModified: new Date(product.updatedAt || new Date()),
                    changeFrequency: "weekly",
                    priority: 0.8,
                }));
            }
        } catch (error) {
            console.error("Error fetching counseling for sitemap:", error);
        }
    } else {
        return new NextResponse("Not Found", { status: 404 });
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
            .map(
                (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified.toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
            )
            .join("")}
</urlset>`;

    return new NextResponse(sitemapXml, {
        headers: {
            "Content-Type": "text/xml",
        },
    });
}
