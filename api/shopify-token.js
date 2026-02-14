
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, shop, apiKey } = req.body;

        if (!code || !shop || !apiKey) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Get secret from environment
        const apiSecret = process.env.SHOPIFY_SECRET_KEY;

        if (!apiSecret) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Exchange code for access token
        const tokenUrl = `https://${shop}/admin/oauth/access_token`;
        
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: apiKey,
                client_secret: apiSecret,
                code: code
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ 
                error: 'Failed to exchange token',
                details: errorText 
            });
        }

        const data = await response.json();

        // Return access token
        return res.status(200).json({
            success: true,
            access_token: data.access_token,
            scope: data.scope
        });

    } catch (error) {
        console.error('Token exchange error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
