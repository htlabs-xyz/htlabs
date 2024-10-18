export async function GET() {
  return Response.json(JSON.stringify(process.env))
}
