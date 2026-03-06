import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Tailwind,
  Button,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  email: string;
}

export const MagicLinkEmail = ({ url, email }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Sign in to your account</Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white border border-gray-200 rounded-lg my-10 px-10 py-8 mx-auto max-w-[600px]">
            <Heading className="text-2xl font-bold text-gray-800 mb-4">
              Welcome back!
            </Heading>
            <Text className="text-gray-600 text-base mb-4">
              We received a request to sign in to your account using{" "}
              <strong>{email}</strong>.
            </Text>
            <Text className="text-gray-600 text-base mb-6">
              Click the button below to securely sign in:
            </Text>

            <Button
              href={url}
              className="bg-black text-white font-bold py-3 px-6 rounded-md text-center block w-full sm:w-auto sm:inline-block"
            >
              Sign In to Dashboard
            </Button>

            <Text className="text-gray-400 text-sm mt-8 border-t border-gray-200 pt-6">
              If the button doesn't work, copy and paste this link into your
              browser:
              <br />
              <Link href={url} className="text-blue-600 break-all">
                {url}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MagicLinkEmail;
