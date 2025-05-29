import React from "react";
import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import FeaturedBoats from "../components/home/FeaturedBoats";
import FeatureBox from "../components/home/FeatureBox";
import ServiceSection from "../components/home/ServiceSection";
import Destinations from "../components/home/Destinations";
import BoatTypes from "../components/home/BoatTypes";
import Testimonials from "../components/home/Testimonials";
import BlogPreview from "../components/home/BlogPreview";
import ContactForm from "../components/home/ContactForm";
import ApiTester from "@/components/debug/ApiTester";

const Index = () => {
  return (
    <Layout isHomePage={true}>
      <Hero />
      <FeaturedBoats />
      <FeatureBox />
      <ServiceSection />
      <Destinations />
      <BoatTypes />
      <Testimonials />
      <BlogPreview />
      <ContactForm />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Dumende Backend Test
        </h1>

        {/* Geçici API Test Paneli */}
        <div className="mb-8">
          <ApiTester />
        </div>

        <div className="text-center text-gray-600">
          <p>
            Backend bağlantı testini yukarıdaki butona tıklayarak
            yapabilirsiniz.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
