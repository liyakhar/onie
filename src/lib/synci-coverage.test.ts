import { describe, expect, it } from "vitest";
import {
  findSynciDirectoryBanks,
  getSynciDirectoryCountry,
  synciDirectoryCountries,
  synciDirectoryUrl,
} from "./synci-coverage";

describe("Synci coverage preview", () => {
  it("includes the published directory snapshot across every supported country", () => {
    const belgium = getSynciDirectoryCountry("BE");

    expect(synciDirectoryCountries).toHaveLength(32);
    expect(belgium.bankCount).toBe(49);
    expect(belgium.banks).toEqual(
      expect.arrayContaining(["Wise", "Revolut", "KBC", "Belfius"]),
    );
    expect(synciDirectoryCountries.reduce((total, country) => total + country.banks.length, 0)).toBe(2932);
  });

  it("searches the selected country without case sensitivity or surrounding spaces", () => {
    expect(findSynciDirectoryBanks("BE", "  wise ")).toEqual(["Wise"]);
    expect(findSynciDirectoryBanks("BE", "fortis")).toEqual([
      "BNP Paribas Fortis",
      "BNP Paribas Fortis Business",
    ]);
    expect(getSynciDirectoryCountry("NL").name).toBe("Netherlands");
    expect(synciDirectoryUrl("NL")).toBe("https://synci.io/banks/netherlands");
  });
});
