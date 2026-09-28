export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { formType, name, email, month, preferredDate, products, photos, videos, includesEditing, calculatedTotal } = req.body;

    let subject = `New Lead: ${formType}`;
    let htmlContent = `<h2>New Request from Content Creation Club Site</h2>`;
    htmlContent += `<p><strong>Form Type:</strong> ${formType}</p>`;
    htmlContent += `<p><strong>Name:</strong> ${name}</p>`;
    htmlContent += `<p><strong>Email:</strong> ${email}</p>`;

    if (month) htmlContent += `<p><strong>Month Requested:</strong> ${month}</p>`;
    if (preferredDate) htmlContent += `<p><strong>Preferred Studio Date:</strong> ${preferredDate}</p>`;
    
    if (formType === 'DFY Custom Quote') {
        htmlContent += `
            <hr>
            <h3>Project Details:</h3>
            <p><strong>Products:</strong> ${products}</p>
            <p><strong>Photos per product:</strong> ${photos}</p>
            <p><strong>Videos per product:</strong> ${videos}</p>
            <p><strong>Editing Included:</strong> ${includesEditing ? 'Yes' : 'No (Raw Footage)'}</p>
            <p><strong>Calculated Total:</strong> <strong>${calculatedTotal}</strong></p>
        `;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Replace with your verified Resend domain email once ready, or use onboarding@resend.dev for testing
                from: 'Content Creation Club <onboarding@resend.dev>',
                to: [process.env.NOTIFICATION_EMAIL || 'YOUR_EMAIL@EXAMPLE.COM'],
                subject: subject,
                html: htmlContent,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email via Resend');
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}