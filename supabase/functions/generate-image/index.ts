Deno.serve(() => {
  return Response.json(
    {
      error: "Deprecated route. Use the secured Express backend /generate-image endpoint.",
    },
    {
      headers: {
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Origin": "*",
      },
      status: 410,
    },
  );
});
