import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { LoyaltyCard, User } from "@/db/schema";
import { CardComponent } from "@/app/customer";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { Link } from "expo-router";
import { Entypo } from "@expo/vector-icons";

export default function TabTwoScreen() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const [loyaltyCards, setLoyaltyCard] = useState<LoyaltyCard[] | undefined>(
    undefined
  );

  const [isLoadingLoyaltyCards, setIsLoadingLoyaltyCards] =
    useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        setIsLoadingLoyaltyCards(true);
        const response = await fetch("/api/business/getBusinessLoyaltyCards", {
          method: "POST",
          body: JSON.stringify({ businessId }),
        });
        const json = await response.json();
        setLoyaltyCard(json.data as LoyaltyCard[]);
        setIsLoadingLoyaltyCards(false);
        console.log({ loyaltyCards });
      } catch (e) {
        console.log(e);
        setError("Something went wrong: " + (e as Error).message);
      }
    }
    start();
  }, []);

  if (isLoadingUser)
    return (
      <ThemedView>
        <ThemedText>"loading user..."</ThemedText>
      </ThemedView>
    );

  if (!user) return <Redirect href="/(tabs)" />;

  return (
    <ThemedView>
      <ThemedView style={{ alignItems: "flex-end" }}>
        <ThemedText>
          <Link
            href={{
              pathname: "/business/[businessId]/newLoyaltyCard",
              params: { businessId: businessId },
            }}
            push
            style={{
              backgroundColor: "slategray",
              paddingHorizontal: 8,
              borderRadius: 10,
            }}
          >
            <ThemedText style={{ fontSize: 12 }}>
              <Entypo name="plus" size={10} color="white" /> Add LoyaltyCard
            </ThemedText>
          </Link>
        </ThemedText>
      </ThemedView>
      {isLoadingLoyaltyCards ? (
        <ThemedText>"loading..."</ThemedText>
      ) : loyaltyCards?.length === 0 ? (
        <ThemedText>No cards</ThemedText>
      ) : (
        loyaltyCards?.map((card) => (
          <LoyaltyCardComponent key={card.id} card={card} />
        ))
      )}
      {error && <ThemedText>{error}</ThemedText>}
    </ThemedView>
  );
}

function LoyaltyCardComponent({ card }: { card: LoyaltyCard }) {
  return (
    <ThemedView>
      <ThemedText>Description: {card.description}</ThemedText>
      <ThemedText>Max Points: {card.maxPoints}</ThemedText>
      <ThemedText>Status: {card.status}</ThemedText>
      <ThemedText>Artwork URL: {card.artworkUrl}</ThemedText>
      <ThemedText>
        Created At: {card.createdAt?.toString().split("T")[0]}
      </ThemedText>
      <ThemedText>Customers View:</ThemedText>
      <CardComponent card={card} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // cardContainer: {
  //   maxWidth: 400,
  // },
  titleContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 32,
  },
});
