const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const data = req.body;
    
    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from('submissions')
      .insert([data]);

    if (error) throw error;

    // Redirect to thank you page after successful submission
    res.status(200).json({ 
      message: 'Form submitted successfully',
      redirect: '/obrigado.html'
    });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
