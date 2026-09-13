import { Router, Response } from "express";
import { Url } from "../config/db.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/analytics (Get aggregated user metrics and statistics - Protected)
router.get("/", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch user's URLs
    const urls = await Url.find({ userId });

    // 1. Overall Metrics
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

    // 2. Favorite count and active count
    const activeUrls = urls.filter((u) => u.isActive).length;
    const favoriteUrls = urls.filter((u) => u.isFavorite).length;

    // 3. Most Visited Links (Top 5 sorted by clicks desc)
    const mostVisited = [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        isFavorite: u.isFavorite,
      }));

    // 4. Recent URLs (Top 5 sorted by createdAt desc)
    const recentUrls = [...urls]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        createdAt: u.createdAt,
      }));

    // Collect all click logs for user's URLs to do fine-grained analytics
    interface ClickWithMetadata {
      timestamp: string;
      browser: string;
      device: string;
      country: string;
    }

    const allClicks: ClickWithMetadata[] = [];
    urls.forEach((url) => {
      (url.clickAnalytics || []).forEach((click) => {
        allClicks.push({
          timestamp: click.timestamp,
          browser: click.browser || "Other",
          device: click.device || "Desktop",
          country: click.country || "United States",
        });
      });
    });

    // 5. Daily Click Graph (Last 7 days click counts)
    const dailyClicksMap: { [date: string]: number } = {};
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      dailyClicksMap[dateStr] = 0;
    }

    // Populate daily clicks from logs
    allClicks.forEach((click) => {
      const clickDate = click.timestamp.split("T")[0];
      if (clickDate in dailyClicksMap) {
        dailyClicksMap[clickDate] += 1;
      }
    });

    const dailyClicks = Object.keys(dailyClicksMap).map((date) => {
      // Convert 'YYYY-MM-DD' to a friendlier label like 'Jul 16'
      const [year, month, day] = date.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const formattedLabel = `${months[dateObj.getMonth()]} ${dateObj.getDate()}`;
      
      return {
        date,
        label: formattedLabel,
        clicks: dailyClicksMap[date],
      };
    });

    // 6. Device Breakdown
    const devicesMap: { [device: string]: number } = { Desktop: 0, Mobile: 0, Tablet: 0 };
    allClicks.forEach((click) => {
      const d = click.device;
      if (d in devicesMap) {
        devicesMap[d] += 1;
      } else {
        devicesMap[d] = 1;
      }
    });
    const deviceStats = Object.keys(devicesMap).map((name) => ({
      name,
      count: devicesMap[name],
      percentage: totalClicks > 0 ? Math.round((devicesMap[name] / totalClicks) * 100) : 0,
    }));

    // 7. Browser Breakdown
    const browsersMap: { [browser: string]: number } = {};
    allClicks.forEach((click) => {
      const b = click.browser;
      browsersMap[b] = (browsersMap[b] || 0) + 1;
    });
    const browserStats = Object.keys(browsersMap)
      .map((name) => ({
        name,
        count: browsersMap[name],
        percentage: totalClicks > 0 ? Math.round((browsersMap[name] / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 browsers

    // 8. Country Breakdown
    const countriesMap: { [country: string]: number } = {};
    allClicks.forEach((click) => {
      const c = click.country;
      countriesMap[c] = (countriesMap[c] || 0) + 1;
    });
    const countryStats = Object.keys(countriesMap)
      .map((name) => ({
        name,
        count: countriesMap[name],
        percentage: totalClicks > 0 ? Math.round((countriesMap[name] / totalClicks) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 countries

    res.json({
      metrics: {
        totalUrls,
        totalClicks,
        activeUrls,
        favoriteUrls,
      },
      mostVisited,
      recentUrls,
      dailyClicks,
      deviceStats,
      browserStats,
      countryStats,
    });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    res.status(500).json({ message: "Server error compiling analytics dashboard statistics." });
  }
});

export default router;
