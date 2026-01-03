"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";

const ClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
});

export type ClientFormState = {
  errors?: {
    name?: string[];
    website?: string[];
    industry?: string[];
    _form?: string[];
  };
  message?: string;
};

export async function createClient(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const validatedFields = ClientSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Client.",
    };
  }

  const { name, website, industry } = validatedFields.data;

  const supabase = await createSupabaseClient();

  // Get current user ensuring authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      message: "Unauthorized.",
    };
  }

  try {
    const { error } = await supabase.from("clients").insert({
      name,
      website: website || null,
      industry: industry || null,
      created_by: user.id,
      is_active: true,
    });

    if (error) {
      logger.error("Supabase Error", error as Error);
      return {
        message: "Database Error: Failed to Create Client.",
      };
    }
  } catch (error) {
    logger.error("Create Client Error", error as Error);
    return {
      message: "Failed to Create Client.",
    };
  }

  revalidatePath("/clients");
  return { message: "Client created successfully!" };
}

export async function updateClient(
  id: string,
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const validatedFields = ClientSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    industry: formData.get("industry"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Client.",
    };
  }

  const { name, website, industry } = validatedFields.data;

  const supabase = await createSupabaseClient();

  try {
    const { error } = await supabase
      .from("clients")
      .update({
        name,
        website: website || null,
        industry: industry || null,
      })
      .eq("id", id);

    if (error) {
      return {
        message: "Database Error: Failed to Update Client.",
      };
    }
  } catch (error) {
    return {
      message: "Failed to Update Client.",
    };
  }

  revalidatePath("/clients");
  return { message: "Client updated successfully!" };
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient();

  try {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/clients");
    return { message: "Deleted Client" };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Client." };
  }
}
