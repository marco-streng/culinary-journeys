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
      id: string;
      name: string;
      address: string;
    };
    group?: {
      name: string;
    };
  };
}

const NewRestaurant = (props: NewRestaurantProps) => {
  const {
    data: { restaurant, group },
  } = props;

  return (
    <Html>
      <Head />
      <Preview>{translations.newRestaurant.preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-gray-200 px-2 font-sans">
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
                {group && (
                  <>
                    <br />
                    <br />
                    {translations.newRestaurant.group} {group.name}
                  </>
                )}
              </Text>
            </Section>
            <Section className="mt-4 text-center">
              <Button
                className="rounded-sm bg-sky-600 px-5 py-3 text-center text-sm text-white no-underline"
                href={`${process.env.HOST}/restaurant/${restaurant.id}`}
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
      id: '68e3f91f-36fc-4465-b728-3756f2c6ff69',
      name: 'Zum goldenen Engel',
      address: 'Am Restaurantweg 1, 95453 Küchenhausen',
    },
    group: {
      name: 'FoodFans',
    },
  },
} as NewRestaurantProps;

export default NewRestaurant;
