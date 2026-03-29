<?php
DB::table('slider_items')->where('title', 'Ropita Kids')->update([
    'text_color' => 'text-emerald-900',
    'button1_color' => 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg border-2 border-emerald-600',
    'button2_color' => 'bg-white/80 backdrop-blur-sm text-emerald-800 border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white shadow-lg'
]);
echo "Done replacing slider styling.\n";
