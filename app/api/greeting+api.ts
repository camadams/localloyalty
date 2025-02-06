export function GET() {
  return Response.json({
    greeting: "Hello world!",
  });
}

export function POST(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  return Response.json({
    greeting: `Hello, ${name}!`,
  });
}
