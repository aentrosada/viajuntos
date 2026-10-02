import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// GET /api/upload-url?folder=trip-items — gera URL assinada para upload
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? "trip-items";
  const ext = searchParams.get("ext") ?? "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("viajuntos")
    .createSignedUploadUrl(`${folder}/${fileName}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const publicUrl = supabase.storage
    .from("viajuntos")
    .getPublicUrl(`${folder}/${fileName}`).data.publicUrl;

  return NextResponse.json({
    signedUrl: data.signedUrl,
    publicUrl,
    path: `${folder}/${fileName}`,
  });
}
