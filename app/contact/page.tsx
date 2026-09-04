'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Stack, Button, Paper, TextField, useTheme, useMediaQuery, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function ContactPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header Navigation */}
      <Box
        component="nav"
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <Logo width={40} height={40} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                TimeWise
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => router.push('/signin')} sx={{ textTransform: 'none', fontSize: '1rem', px: 3 }}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, pt: isMobile ? 10 : 12, pb: 6 }}>
        <Container maxWidth="md">
          <Stack spacing={6}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
                Get In Touch
              </Typography>
              <Typography variant="h6" sx={{ color: '#666', lineHeight: 1.8, maxWidth: '600px', mx: 'auto' }}>
                We'd love to hear from you. Send us a message and we'll respond as quickly as possible.
              </Typography>
            </Box>

            {/* Contact Information */}
            <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 3, mb: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, backgroundColor: '#fff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2196f3' }}>
                  Email
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  support@timewise-hrms.com
                </Typography>
              </Paper>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, backgroundColor: '#fff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2196f3' }}>
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  +1 (555) 123-4567
                </Typography>
              </Paper>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, backgroundColor: '#fff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2196f3' }}>
                  Hours
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Mon-Fri, 9AM-5PM EST
                </Typography>
              </Paper>
            </Box>

            {/* Contact Form */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="medium"
                  />
                  <TextField
                    fullWidth
                    label="Your Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="medium"
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="medium"
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    multiline
                    rows={6}
                  />
                  <Box sx={{ pt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                    >
                      Send Message
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Paper>

            {/* FAQ Section */}
            <Paper sx={{ p: isMobile ? 3 : 4, borderRadius: 2, backgroundColor: '#fff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2196f3' }}>
                Frequently Asked Questions
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    What is the typical response time?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    Do you offer technical support?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    Yes! We provide 24/7 technical support to all our customers. Simply reach out through this form or call our support team.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a237e', mb: 1 }}>
                    How can I report a security issue?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.7 }}>
                    Please report security concerns directly to security@timewise-hrms.com with detailed information about the vulnerability.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ backgroundColor: '#1a237e', color: '#fff', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2024 TimeWise HRMS. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
