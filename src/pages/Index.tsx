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
    </Layout>
  );
};

export default Index;
