export const supabase = {
  from: (table: string) => ({
    select: () => ({ data: [] }),
    insert: () => ({ error: null }),
    update: () => ({ error: null }),
  })
}
