import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.has('icon_url') ? searchParams.get('icon_url') : '';
  const iconUrl = query || 'https://github.com/hugovk.png?size=80';

    // Fetch the image and convert it to a Base64-encoded string
    const imageResponse = await fetch(iconUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    // Determine the MIME type (assuming the URL provided returns a JPEG)
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

  const svgContent = `
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g clip-path="url(#clip0_170_176310)">
        <mask id="mask0_170_176310" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96">
        <circle cx="48" cy="48" r="48" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_170_176310)">
        <rect width="96" height="96" fill="url(#pattern0_170_176310)"/>
        </g>
        </g>
        <defs>
        <pattern id="pattern0_170_176310" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlink:href="#image0_170_176310" transform="scale(0.0125)"/>
        </pattern>
        <clipPath id="clip0_170_176310">
        <rect width="96" height="96" fill="white"/>
        </clipPath>
        <image id="image0_170_176310" width="80" height="80" xlink:href="data:${mimeType};base64,${imageBase64}"/>
        </defs>
    </svg>`;
  const response = new NextResponse(svgContent);
  response.headers.set('Content-Type', 'image/svg+xml');
  return response;
}