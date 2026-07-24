import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setProjects(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
