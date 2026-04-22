import { supabase } from '../lib/supabase';

export async function uploadPlantImage(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('plant-images').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('plant-images').getPublicUrl(path);
  return data.publicUrl;
}
