    import { createClient } from '@supabase/supabase-js';
    import * as dotenv from 'dotenv';
    dotenv.config();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Function to remove duplicate variants from Supabase
    async function removeDuplicateVariants() {
      try {
        // Fetch all variants
        const { data: variants, error: fetchError } = await supabase
          .from('variants')
          .select('*');

        if (fetchError) {
          console.error('Error fetching variants:', fetchError);
          return;
        }

        // Identify duplicate variants
        const duplicates = [];
        const uniqueVariants = [];

        for (const variant of variants) {
          const isDuplicate = uniqueVariants.some(
            (uniqueVariant) =>
              uniqueVariant.product_id === variant.product_id &&
              uniqueVariant.name === variant.name &&
              uniqueVariant.image_url === variant.image_url
          );

          if (isDuplicate) {
            duplicates.push(variant);
          } else {
            uniqueVariants.push(variant);
          }
        }

        // Delete duplicate variants
        for (const duplicate of duplicates) {
          const { error: deleteError } = await supabase
            .from('variants')
            .delete()
            .eq('id', duplicate.id);

          if (deleteError) {
            console.error('Error deleting duplicate variant:', deleteError);
          } else {
            console.log(`Deleted duplicate variant with ID: ${duplicate.id}`);
          }
        }

        console.log('Duplicate variants removal process completed.');
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }

    // Call the function to remove duplicate variants
    removeDuplicateVariants();
