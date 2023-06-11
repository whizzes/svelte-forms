import { describe, expect, it } from "vitest";

import { clone } from "../src/utils";

describe("Utils: clone", () => {
  it("clones an object w/o overriding values", () => {
    const values = {
      firstName: "James",
      lastName: "Bond",
      agentNumber: "007",
      gender: "male",
      isActive: true,
      inventory: [
        {
          id: 1,
          name: "foo",
        },
        {
          id: 2,
          name: "bar",
        },
      ],
    };

    const valuesClone = clone(values);

    expect(valuesClone).toEqual(values);
  });

  it("clones an object overriding values", () => {
    const values = {
      firstName: "James",
      lastName: "Bond",
      agentNumber: "007",
      gender: "male",
      isActive: true,
      inventory: [
        {
          id: 1,
          name: "foo",
        },
        {
          id: 2,
          name: "bar",
        },
      ],
    };

    const expected = {
      firstName: "Bond, James Bond",
      lastName: "Bond, James Bond",
      agentNumber: "Bond, James Bond",
      gender: "Bond, James Bond",
      isActive: "Bond, James Bond",
      inventory: "Bond, James Bond",
    };

    const valuesClone = clone(values, "Bond, James Bond");

    expect(valuesClone).toEqual(expected);
  });

  it("clones arrays w/o holding references", () => {
    expect.assertions(3);

    const inventory = [
      {
        id: 1,
        name: "foo",
      },
      {
        id: 2,
        name: "bar",
      },
    ];
    const values = {
      firstName: "James",
      lastName: "Bond",
      agentNumber: "007",
      gender: "male",
      isActive: true,
      inventory,
    };

    const valuesClone = clone(values);

    expect(valuesClone).toEqual(values);

    inventory.push({
      id: 2,
      name: "baz",
    });

    expect(values.inventory).toEqual([
      {
        id: 1,
        name: "foo",
      },
      {
        id: 2,
        name: "bar",
      },
      {
        id: 2,
        name: "baz",
      },
    ]);
    expect(valuesClone.inventory).toEqual([
      {
        id: 1,
        name: "foo",
      },
      {
        id: 2,
        name: "bar",
      },
    ]);
  });

  it("clones objects w/o holding references", () => {
    expect.assertions(3);

    const values = {
      firstName: "James",
      lastName: "Bond",
      agentNumber: "007",
      gender: "male",
      isActive: true,
      pet: {
        kind: "dog",
        name: "Meatball",
        age: 2,
      },
    };

    const valuesClone = clone(values);

    expect(valuesClone).toEqual(values);

    values.pet.name = "Rango";

    expect(values.pet).toEqual({
      kind: "dog",
      name: "Rango",
      age: 2,
    });
    expect(valuesClone.pet).toEqual({
      kind: "dog",
      name: "Meatball",
      age: 2,
    });
  });
});
