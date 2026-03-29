import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ChevronRight,
  Zap,
  Shield,
  Truck,
  Clock,
  Tag,
  TrendingUp,
  Heart,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import Carousel from "../components/Carousel";
import SimpleCarousel3D from "../components/SimpleCarousel3D";
import SEO from "../components/SEO";
import { productsAPI, categoriesAPI, brandsAPI, settingsAPI, sliderAPI } from "../services/api";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { getStorageUrl } from "../config/env";

const Index = () => {
  const { siteName, headerLogo } = useSiteSettings();
  
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();

  // API State
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [sliderItems, setSliderItems] = useState<any[]>([]);
  const [headerSettings, setHeaderSettings] = useState<any>({});
  const [generalSettings, setGeneralSettings] = useState<any>({});
  const [footerSettings, setFooterSettings] = useState<any>({});
  const [seoSettings, setSeoSettings] = useState<any>({});
  const [socialSettings, setSocialSettings] = useState<any>({});
  const [contactSettings, setContactSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load all data
        const [
          featuredResponse,
          latestResponse,
          categoriesResponse,
          brandsResponse,
          headerSettingsRes,
          generalSettingsRes,
          footerSettingsRes,
          seoSettingsRes,
          contactSettingsRes,
          sliderResponse
        ] = await Promise.all([
          productsAPI.getFeaturedProducts(),
          productsAPI.getLatestProducts(),
          categoriesAPI.getCategories(),
          brandsAPI.getBrands(),
          settingsAPI.getSettings('header'),
          settingsAPI.getSettings('general'),
          settingsAPI.getSettings('footer'),
          settingsAPI.getSettings('seo'),
          settingsAPI.getSettings('contact').catch(() => ({ data: {} })),
          sliderAPI.getSliderItems().catch(() => ({ data: [] }))
        ]);

        setFeaturedProducts(featuredResponse.data || []);
        setLatestProducts(latestResponse.data || []);
        setCategories(categoriesResponse.data || []);
        setBrands(brandsResponse.data || []);
        setHeaderSettings(headerSettingsRes.data || {});
        setGeneralSettings(generalSettingsRes.data || {});
        setFooterSettings(footerSettingsRes.data || {});
        setSeoSettings(seoSettingsRes.data || {});
        setContactSettings(contactSettingsRes.data || {});
        setSliderItems(sliderResponse.data || []);
        setSocialSettings(headerSettingsRes.data || {});

        // Debug: Log categories to check show_in_slider
        console.log('Categories loaded:', categoriesResponse.data);
        console.log('Categories with show_in_slider:', categoriesResponse.data?.filter((cat: any) => cat.show_in_slider));
      } catch (err) {
        setError("حدث خطأ في تحميل البيانات");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Use categories from API or fallback to static data
  // Filter categories to show only those with show_in_slider = true
  const mainCategories = categories.length > 0 ? (() => {
    const filtered = categories.filter(cat => {
      // Handle both boolean true and string "true" or "1"
      const showInSlider = cat.show_in_slider;
      const shouldShow = showInSlider === true || showInSlider === 1 || showInSlider === "true" || showInSlider === "1";
      console.log(`Category "${cat.name}": show_in_slider = ${showInSlider} (${typeof showInSlider}), shouldShow = ${shouldShow}`);
      return shouldShow;
    });
    console.log('Filtered categories for slider:', filtered);
    return filtered.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image || "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&auto=format&q=80",
      href: `/products?category_id=${cat.id}`,
      color: cat.color || "bg-emerald-500"
    }));
  })() : [];

  // Brand Categories - Load from API (only brands with products)
  const brandCategories = brands.length > 0 ? brands
    .filter(brand => (brand.products_count || 0) > 0) // Only show brands with products
    .map(brand => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo || '',
      productCount: brand.products_count || 0,
      slug: brand.slug || brand.name.toLowerCase(),
    })) : [];

  // Use featured products from API or fallback to static data
  const featuredOffers = featuredProducts.map((product) => {
    const firstImage = product.images?.[0] ?? {};
    const imageUrl =
      firstImage.image_url ||
      firstImage.image_path ||
      firstImage.url ||
      product.image ||
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop";

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: imageUrl,
      rating: product.rating || 0,
      reviews: product.reviews_count || 0,
      category: product.category?.name || "عام",
      discount: product.discount_percentage || 0,
      isNew: product.is_new || false,
      isBestSeller: Boolean(product.is_featured || product.is_best_seller),
    };
  });

  // Latest products from API (no fallback)
  const latestProductsData = latestProducts.map((product) => {
    const firstImage = product.images?.[0] ?? {};
    const imageUrl =
      firstImage.image_url ||
      firstImage.image_path ||
      firstImage.url ||
      product.image ||
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop";

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: imageUrl,
      rating: product.rating || 0,
      reviews: product.reviews_count || 0,
      brand: product.brand?.name || "",
      discount: product.discount_percentage || 0,
      isNew: product.is_new || true,
      stockStatus: product.stock_status || (product.in_stock ? "متوفر" : "غير متوفر"),
    };
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header
          showSearch={true}
          showActions={true}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header
          showSearch={true}
          showActions={true}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-xl text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Get logo URL (use headerLogo from context)
  const logoUrl = getStorageUrl(headerLogo) || `${siteUrl}/placeholder.svg`;

  // Get social media links for sameAs
  const socialLinks = [
    socialSettings.social_media_facebook,
    socialSettings.social_media_twitter,
    socialSettings.social_media_instagram,
    socialSettings.social_media_linkedin,
    socialSettings.social_media_youtube,
    socialSettings.social_media_telegram
  ].filter(Boolean);

  // Structured Data for Homepage - Multiple Schemas
  const structuredDataArray = [
    // Organization Schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteName || "",
      "alternateName": siteName || "",
      "url": siteUrl,
      "logo": logoUrl,
      "image": logoUrl,
      "description": seoSettings.seo_meta_description || `متجر متخصص في ملابس وألعاب الأطفال${siteName ? ` في ${siteName}` : ''}.`,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PS"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": socialSettings.header_phone || "",
        "contactType": "customer service",
        "areaServed": "PS",
        "availableLanguage": ["ar"]
      },
      "sameAs": socialLinks,
      "areaServed": "PS"
    },
    // LocalBusiness Schema
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": siteName || "",
      "image": logoUrl,
      "description": seoSettings.seo_meta_description || `متجر ملابس وألعاب الأطفال${siteName ? ` في ${siteName}` : ''}.`,
      "url": siteUrl,
      "telephone": socialSettings.header_phone || "",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PS"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 32.4609,
        "longitude": 35.2999
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      },
      "priceRange": "$$",
      "servesCuisine": false,
      "areaServed": "PS",
      "hasMap": "https://www.google.com/maps?q=32.4609,35.2999"
    },
    // Store Schema
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": siteName || generalSettings.site_name || "",
      "description": seoSettings.seo_meta_description || `متجر متخصص في ملابس وألعاب الأطفال${(siteName || generalSettings.site_name) ? ` في ${siteName || generalSettings.site_name}` : ''}.`,
      "url": siteUrl,
      "logo": logoUrl,
      "image": logoUrl,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PS"
      },
      "sameAs": socialLinks,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/products?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "ILS",
        "availability": "https://schema.org/InStock"
      }
    },
    // BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": siteUrl
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <SEO
        title={seoSettings.seo_meta_title || (siteName ? `${siteName} - ${generalSettings.site_tagline || ""}` : "الرئيسية")}
        description={seoSettings.seo_meta_description || `تسوق أفضل ملابس وألعاب الأطفال${siteName ? ` في ${siteName}` : ''}. جودة عالية وتوصيل سريع.`}
        keywords={seoSettings.seo_meta_keywords || `ملابس أطفال, ألعاب أطفال, تسوق${siteName ? `, ${siteName}` : ''}`}
        image={getStorageUrl(headerLogo) || '/logo.webp'}
        structuredData={structuredDataArray}
      />
      <Header
        showSearch={true}
        showActions={true}
      />

      {/* SEO H1 - Screen reader only, hidden visually */}
      <h1 className="sr-only">{seoSettings.seo_meta_title || (siteName ? `${siteName} - ${generalSettings.site_tagline || ""}` : "")}</h1>


      {/* Hero Slider Section - only shows when slider items exist */}
      {sliderItems.length > 0 && (
        <section className="relative w-full overflow-hidden">
          <div className="w-full px-4 md:px-0 mt-4 md:mt-0">
            <div className="rounded-2xl md:rounded-none overflow-hidden shadow-md md:shadow-none relative z-0 transform-gpu">
              <Carousel
                slidesToShow={{ mobile: 1, tablet: 1, desktop: 1 }}
                showDots={false}
                showArrows={true}
                gap={0}
                autoplay={true}
                rtl={true}
              >
                {sliderItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative ${item.text_color} py-12 sm:py-16 lg:py-24 overflow-hidden min-h-[350px] sm:min-h-[450px] lg:min-h-[600px] flex items-center justify-start`}
                    style={item.image ? {
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      width: '100%',
                      height: '100%',
                    } : {}}
                  >
                    {/* Admin-editable overlay gradient */}
                    {item.background_color && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.background_color} z-0 pointer-events-none`}></div>
                    )}

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex items-center">
                      <div className="max-w-2xl w-full pr-4 sm:pr-8 lg:pr-12">
                        {item.title && (
                          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight text-gray-900 drop-shadow-md">
                            {item.title}
                            {item.subtitle && (
                              <span className="block mt-3 sm:mt-4 lg:mt-6 text-xl sm:text-3xl lg:text-4xl text-emerald-600 font-bold drop-shadow-md">
                                {item.subtitle}
                              </span>
                            )}
                          </h2>
                        )}
                        {item.description && (
                          <p className="text-sm sm:text-lg lg:text-2xl mb-6 sm:mb-8 lg:mb-10 leading-relaxed text-gray-800 font-semibold drop-shadow max-w-xl">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-row flex-wrap gap-3 sm:gap-4 lg:gap-5">
                          {item.button1_text && item.button1_link && (
                            <Link
                              to={item.button1_link}
                              className={`${item.button1_color && item.button1_color !== '' ? item.button1_color : 'bg-emerald-600 text-white hover:bg-emerald-700'} px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-4 rounded-full font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base lg:text-lg border-2 border-transparent`}
                            >
                              {item.button1_text}
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            </Link>
                          )}
                          {item.button2_text && item.button2_link && (
                            <Link
                              to={item.button2_link}
                              className={`${item.button2_color && item.button2_color !== '' ? item.button2_color : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-gray-300'} px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-4 rounded-full font-bold hover:scale-105 hover:shadow-xl transition-all duration-300 text-center text-sm sm:text-base lg:text-lg border-2`}
                            >
                              {item.button2_text}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* Section 1: Main Categories */}
      <section className="pt-8 pb-4 md:pt-12 md:pb-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">التصنيفات الرئيسية</h2>
            <p className="text-xs md:text-lg text-gray-600">اختر من بين مجموعة واسعة من الفئات المتخصصة</p>
          </div>

          {mainCategories.length > 0 ? (
            <Carousel
              slidesToShow={{ mobile: 1, tablet: 1, desktop: 1 }}
              showDots={true}
              showArrows={true}
              gap={20}
              rtl={true}
            >
              {/* Split categories into pages of up to 12 items for flex-wrap grid */}
              {Array.from({ length: Math.ceil(mainCategories.length / 12) }, (_, i) => {
                const pageItems = mainCategories.slice(i * 12, i * 12 + 12);
                return (
                  <div key={i} className="flex flex-wrap justify-center gap-4 md:gap-8 py-4">
                    {pageItems.map((category, idx) => (
                      <Link
                        key={category.id || `${i}-${idx}`}
                        to={category.href}
                        className="group flex flex-col items-center gap-2 transition-all duration-300"
                      >
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:shadow-xl group-hover:border-emerald-500 transition-all duration-500 transform group-hover:scale-105">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                        </div>
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 text-center transition-all duration-300 group-hover:text-emerald-600 line-clamp-1">
                          {category.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </Carousel>
          ) : (
            <div className="text-center py-8 text-gray-500">لا توجد تصنيفات متاحة</div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300"
          >
            عرض جميع التصنيفات
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Section 2: Brand Categories */}
      <section className="py-6 md:py-12 bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">تسوق حسب العلامة التجارية</h2>
            <p className="text-sm md:text-xl text-gray-600 mb-1 md:mb-2">نعمل مع أفضل العلامات التجارية العالمية</p>
            <p className="text-xs md:text-sm text-gray-500">اختر من بين مجموعة متنوعة من العلامات التجارية الموثوقة</p>
          </div>

          {brandCategories.length > 0 ? (
            <>
              <Carousel
                slidesToShow={{ mobile: 1, tablet: 1, desktop: 1 }}
                showDots={true}
                showArrows={true}
                gap={15}
                rtl={true}
              >
                {/* Split brands into pages of up to 14 items for flex-wrap grid */}
                {Array.from({ length: Math.ceil(brandCategories.length / 14) }, (_, i) => {
                  const pageItems = brandCategories.slice(i * 14, i * 14 + 14);
                  return (
                    <div key={i} className="flex flex-wrap justify-center gap-4 md:gap-8 py-4">
                      {pageItems.map((brand, idx) => (
                        <Link
                          key={brand.id || `${i}-${idx}`}
                          to={`/products?brand_id=${brand.id || ''}`}
                          className="group flex flex-col items-center gap-2 transition-all duration-300"
                          aria-label={`تسوق منتجات ${brand.name}`}
                        >
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center p-3 sm:p-5 group-hover:border-emerald-400 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-gray-400 text-[10px] sm:text-xs font-bold text-center px-1">
                                {brand.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </Carousel>
              <div className="text-center mt-6 md:mt-8">
                <Link
                  to="/brands"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  عرض جميع الماركات
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">لا توجد علامات تجارية متاحة</div>
          )}
        </div>
      </section>

      {/* Section 3: Featured Offers */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">العروض والأصناف المميزة</h2>
            <p className="text-sm md:text-xl text-gray-600">اغتنم الفرصة واحصل على أفضل الصفقات</p>
          </div>

          {featuredOffers.length > 0 ? (
            <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {featuredOffers.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <Link to={`/product/${product.id}`} className="block" aria-label={product.name}>
                    <div className="relative p-2 md:p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        width="300"
                        height="300"
                        className="w-full h-32 md:h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 md:top-6 md:right-6 flex flex-col gap-1 md:gap-2">
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <span className="bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                            خصم {(product.originalPrice - product.price).toLocaleString()} ₪
                          </span>
                        ) : null}
                        {product.isNew ? (
                          <span className="bg-green-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                            جديد
                          </span>
                        ) : null}
                        {product.isBestSeller ? (
                          <span className="bg-emerald-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                            الأكثر مبيعاً
                          </span>
                        ) : null}
                      </div>

                      <button className="absolute top-3 left-3 md:top-6 md:left-6 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                      </button>
                    </div>
                  </Link>

                  <div className="p-3 md:p-6">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-gray-800 mb-1 md:mb-2 text-sm md:text-base line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
                      <span className="text-lg md:text-2xl font-bold text-emerald-600">{product.price} ₪</span>
                      {product.originalPrice && product.originalPrice > 0 ? (
                        <span className="text-xs md:text-sm text-gray-500 line-through">{product.originalPrice} ₪</span>
                      ) : null}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        triggerAnimation(e.currentTarget, {
                          image: product.image,
                          name: product.name,
                        });
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          brand: "متنوع",
                        });
                      }}
                      className="w-full bg-emerald-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm md:text-base"
                    >
                      أضف للسلة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد عروض مميزة متاحة حالياً.
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              تصفح جميع المنتجات
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Latest Products */}
      <section className="py-4 md:py-8 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">المنتجات الأحدث</h2>
            <p className="text-sm md:text-xl text-gray-600">اكتشف أحدث ما وصل إلى متجرنا</p>
          </div>

          {latestProductsData.length > 0 ? (
            <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProductsData.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <Link to={`/product/${product.id}`} className="block" aria-label={product.name}>
                    <div className="relative p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        width="300"
                        height="300"
                        className="w-full h-40 object-contain bg-white rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isNew ? (
                        <span className="absolute top-6 right-6 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          جديد
                        </span>
                      ) : null}
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <span className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          خصم {(product.originalPrice - product.price).toLocaleString()} ₪
                        </span>
                      ) : null}

                      <button className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-emerald-600">{product.price} ₪</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {product.stockStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          triggerAnimation(e.currentTarget, {
                            image: product.image,
                            name: product.name,
                          });
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            brand: product.brand,
                          });
                        }}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                      >
                        أضف للسلة
                      </button>
                      <button className="p-3 bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد منتجات جديدة متاحة حالياً.
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              استعرض المزيد من المنتجات
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-emerald-50 text-emerald-900 border-t border-emerald-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-emerald-900">اشترك في نشرتنا الإخبارية</h2>
          <p className="text-base md:text-lg text-emerald-700 mb-8 max-w-2xl mx-auto">
            كن أول من يعلم بالعروض الجديدة والمنتجات الحصرية
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-1 px-5 py-3 rounded-full text-gray-800 bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-md w-full sm:w-auto">
              اشتراك
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-green-50/50 transition-colors">
              <Truck className="w-10 h-10 text-emerald-600 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-lg font-bold text-gray-800 mb-1">شحن مجاني</h3>
                <p className="text-gray-500 text-sm font-medium">للطلبات أكثر من 500 شيكل</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-green-50/50 transition-colors">
              <Shield className="w-10 h-10 text-emerald-600 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-lg font-bold text-gray-800 mb-1">ضمان شامل</h3>
                <p className="text-gray-500 text-sm font-medium">على جميع المنتجات</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-green-50/50 transition-colors">
              <Clock className="w-10 h-10 text-emerald-600 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-lg font-bold text-gray-800 mb-1">خدمة 24/7</h3>
                <p className="text-gray-500 text-sm font-medium">دعم فني متواصل</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={getStorageUrl(headerLogo) || "/logo.webp"}
                  alt={siteName || "روبيتا"}
                  className="h-12 w-auto"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{siteName || generalSettings.site_name || ""}</h3>
                  <p className="text-xs text-gray-500 font-medium">{generalSettings.site_tagline || ""}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                {footerSettings.footer_about_text || ""}
              </p>
              {/* روابط التواصل الاجتماعي */}
              <div className="flex flex-wrap gap-3">
                {socialSettings.social_media_facebook && (
                  <a
                    href={socialSettings.social_media_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    aria-label="فيسبوك"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M13.5 9H16l.5-3h-3V4.5c0-.86.22-1.5 1.5-1.5H17V0h-2.5C11.57 0 10 1.57 10 4.5V6H8v3h2v9h3.5V9z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_twitter && (
                  <a
                    href={socialSettings.social_media_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    aria-label="تويتر"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M22.162 5.656c-.793.352-1.643.589-2.53.696a4.454 4.454 0 001.958-2.456 8.909 8.909 0 01-2.825 1.08 4.437 4.437 0 00-7.556 4.045A12.59 12.59 0 013.173 4.9a4.435 4.435 0 001.373 5.917 4.4 4.4 0 01-2.01-.555v.056a4.44 4.44 0 003.556 4.35 4.457 4.457 0 01-2.004.076 4.445 4.445 0 004.148 3.08A8.9 8.9 0 012 19.54a12.55 12.55 0 006.79 1.99c8.147 0 12.598-6.75 12.598-12.598 0-.192-.004-.383-.013-.573a9 9 0 002.22-2.303z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_instagram && (
                  <a
                    href={socialSettings.social_media_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                    aria-label="إنستغرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm6.5-.25a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_linkedin && (
                  <a
                    href={socialSettings.social_media_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all shadow-sm"
                    aria-label="لينكد إن"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_youtube && (
                  <a
                    href={socialSettings.social_media_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    aria-label="يوتيوب"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_telegram && (
                  <a
                    href={socialSettings.social_media_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-emerald-400 hover:text-white transition-all shadow-sm"
                    aria-label="تيليجرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.927 6.654-1.309 8.838-.17.968-.504 1.291-.828 1.323-.696.062-1.223-.459-1.897-.9-1.05-.692-1.644-1.123-2.664-1.798-1.18-.78-.415-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14a.49.49 0 01.168.343c.01.05.015.131.003.199z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:right-0 after:w-1/2 after:h-1 after:bg-emerald-500 after:rounded-full">روابط سريعة</h3>
              <ul className="space-y-3 text-gray-600 font-medium">
                <li><Link to="/about" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">من نحن</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">اتصل بنا</Link></li>
                <li><Link to="/shipping" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">الشحن والتوصيل</Link></li>
                <li><Link to="/returns" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">الإرجاع والاستبدال</Link></li>
                <li><Link to="/warranty" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">الضمان</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:right-0 after:w-1/2 after:h-1 after:bg-emerald-500 after:rounded-full">الفئات</h3>
              <ul className="space-y-3 text-gray-600 font-medium">
                {categories
                  .filter((cat: any) => !cat.parent_id && cat.is_active !== 0 && cat.is_active !== false)
                  .slice(0, 5)
                  .map((category: any) => (
                    <li key={category.id}>
                      <Link
                        to={category.slug ? `/products?category_id=${category.id}` : `/products`}
                        className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                {categories.filter((cat: any) => !cat.parent_id && cat.is_active !== 0 && cat.is_active !== false).length === 0 && (
                  <>
                    <li><Link to="/products" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">جميع المنتجات</Link></li>
                    <li><Link to="/categories" className="hover:text-emerald-600 hover:translate-x-[-4px] transition-all inline-block">جميع الفئات</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:right-0 after:w-1/2 after:h-1 after:bg-emerald-500 after:rounded-full">تواصل معنا</h3>
              <div className="space-y-4 text-gray-600 font-medium">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <span>
                    {(contactSettings.contact_info?.find((item: any) => item.type === 'address')?.details) && 
                      (Array.isArray(contactSettings.contact_info?.find((item: any) => item.type === 'address')?.details) 
                        ? (contactSettings.contact_info?.find((item: any) => item.type === 'address')?.details as string[]).join(", ") 
                        : contactSettings.contact_info?.find((item: any) => item.type === 'address')?.details) ||
                      "فلسطين"}
                  </span>
                </div>
                {socialSettings.header_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <a href={`tel:${socialSettings.header_phone.replace(/[^0-9+]/g, '')}`} className="hover:text-emerald-600 transition-colors">
                      <span dir="ltr" className="inline-block">{socialSettings.header_phone}</span>
                    </a>
                  </div>
                )}
                {socialSettings.header_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <a href={`mailto:${socialSettings.header_email}`} className="hover:text-emerald-600 transition-colors">
                      <span dir="ltr" className="inline-block">{socialSettings.header_email}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-6 text-center text-gray-500 text-sm font-medium">
            <p>{footerSettings.footer_copyright || `© ${new Date().getFullYear()} ${siteName || generalSettings.site_name || ""}. جميع الحقوق محفوظة.`}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
