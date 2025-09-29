export const NextResponse = {
  json: (data: any, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), init);
  }
};
