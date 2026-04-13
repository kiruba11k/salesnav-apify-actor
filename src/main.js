import { Actor } from 'apify';
import axios from 'axios';

await Actor.init();

const input = await Actor.getInput();

if (!input?.url) {
    throw new Error("Missing Sales Navigator URL in input");
}

const SALES_NAV_URL = input.url;

const TOKEN = process.env.APIFY_TOKEN;

const ACTOR_ID = "pratikdani~sales-navigator-company-search-scraper-no-cookies";

async function runSalesNav() {

    const endpoint =
        `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${TOKEN}`;

    const payload = {
        url: SALES_NAV_URL
    };

    console.log("Running external SalesNav actor...");

    const response = await axios.post(endpoint, payload, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data;
}

try {

    const companies = await runSalesNav();

    console.log(`Companies found: ${companies.length}`);

    const formatted = companies.map(c => ({
        company_name: c.companyName,
        company_id: c.companyId,
        description: c.description,
        industry: c.industry,
        employee_range: c.employeeCountRange,
        employee_display: c.employeeDisplayCount,
        linkedin_url: c.navigationUrl,
        logo: c.companyPictureDisplayImage
    }));

    await Actor.pushData(formatted);

    await Actor.setValue("OUTPUT", formatted);

} catch (error) {

    console.error("Actor failed:", error);

    await Actor.setValue("ERROR", {
        message: error.message
    });

}

await Actor.exit();
