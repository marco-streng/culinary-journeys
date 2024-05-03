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

interface NewRatingProps {
  data: {
    rating: number;
    user: {
      name: string;
    };
    restaurant: {
      name: string;
    };
  };
}

const NewRating = (props: NewRatingProps) => {
  const {
    data: { rating, user, restaurant },
  } = props;

  return (
    <Html>
      <Head />
      <Preview>{translations.newRating.preview}</Preview>
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
              {translations.newRating.headline}
            </Heading>
            <Section className="my-8">
              <Text className="mx-auto h-[43px] w-[60px] rounded-full bg-sky-600 pt-[17px] text-center text-[30px] text-white">
                3
              </Text>
              <Text className="mx-8 rounded-lg border border-solid border-gray-200 p-4 text-center">
                {user.name} {translations.newRating.content[0]}{' '}
                {restaurant.name} {translations.newRating.content[1]} {rating}{' '}
                {translations.newRating.content[3]}
              </Text>
            </Section>
            <Section className="mt-4 text-center">
              <Button
                className="rounded-sm bg-sky-600 px-5 py-3 text-center text-sm text-white no-underline"
                href={process.env.HOST}
              >
                {translations.newRating.open}
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

NewRating.PreviewProps = {
  data: {
    rating: 4,
    user: {
      name: 'Max Mustermann',
    },
    restaurant: {
      name: 'Zum goldenen Engel',
      address: 'Am Restaurantweg 1, 95453 Küchenhausen',
    },
  },
} as NewRatingProps;

export default NewRating;
