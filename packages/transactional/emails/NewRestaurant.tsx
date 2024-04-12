import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import 'dotenv/config';
import * as translations from '../translations/de.json';

interface NewRestaurantProps {
  data: {
    restaurant: {
      name: string;
      address: string;
    };
  };
}

const NewRestaurant = (props: NewRestaurantProps) => {
  const {
    data: { restaurant },
  } = props;

  return (
    <Html>
      <Head />
      <Preview>{translations.newRestaurant.preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-stone-200 px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm bg-white p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${process.env.HOST}/logo.png`}
                width="108"
                height="137"
                alt="Culinary Journeys"
                className="mx-auto mb-16"
              />
            </Section>
            <Heading className="mx-0 mb-2 mt-0 p-0 text-center text-[20px] font-bold">
              {translations.newRestaurant.headline}
            </Heading>
            <Section className="my-8">
              <Text className="mx-8 rounded-lg border border-solid border-gray-200 p-4 text-center">
                <strong>{restaurant.name}</strong>
                <br />
                {restaurant.address}
              </Text>
            </Section>
            <Section className="mt-4 text-center">
              <Button
                className="rounded-sm bg-sky-600 px-5 py-3 text-center text-sm text-white no-underline"
                href={process.env.HOST}
              >
                {translations.newRestaurant.open}
              </Button>
            </Section>
            <Text className="mt-[100px] text-center text-xs text-gray-400">
              {translations.footer}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

NewRestaurant.PreviewProps = {
  data: {
    restaurant: {
      name: 'Zum goldenen Engel',
      address: 'Am Restaurantweg 1, 95453 Küchenhausen',
    },
  },
} as NewRestaurantProps;

export default NewRestaurant;
