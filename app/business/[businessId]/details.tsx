import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getUser } from "@/db/dummyData";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { LoyaltyCard, User } from "@/db/schema";
import { GetBusinessDetailsResponse } from "@/app/api/business/getBusinessDetails+api";

// export default function TabTwoScreen() {
//   return "hiii";
// }

/**
 * Renders the details of a business, such as its name, owner, email, and image.
 * @returns A ThemedView component containing the business's details.
 */
export default function Employees() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [cards, setCards] = useState<LoyaltyCard[] | undefined>(undefined);
  const { businessId } = useGlobalSearchParams<{ businessId: string }>();
  const [businessDetails, setBusinessDetails] = useState<
    GetBusinessDetailsResponse | undefined
  >(undefined);

  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function start() {
      try {
        const user = await getUser();
        setUser(user);
        setIsLoadingUser(false);

        console.log({ businessId, here: "!!!!!!!1" });

        const response = await fetch("/api/business/getBusinessDetails", {
          method: "POST",
          body: JSON.stringify({ businessId }),
        });
        const businessDetails = (await response.json())
          .businessDetails as GetBusinessDetailsResponse;
        setBusinessDetails(businessDetails);
        console.log({ businessDetails });
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
    <ThemedView style={{ padding: 10 }}>
      <ThemedText>Business Name: {businessDetails?.businessName}</ThemedText>
      <ThemedText>Owner: {businessDetails?.businessOwnersName}</ThemedText>
      <ThemedText>Email: {businessDetails?.businessOwnersEmail}</ThemedText>
      <ThemedText>Image: {businessDetails?.businessOwnersImg}</ThemedText>
      {error && <ThemedText>{error}</ThemedText>}
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
