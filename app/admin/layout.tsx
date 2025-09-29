import { Container } from '@mui/material';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {children}
    </Container>
  );
}