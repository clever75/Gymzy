// Tests de la famille d'un membre.
// Lancer : node --test lib/member-family.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { getFamily } from "./member-family.ts";
import { mockMembers } from "./mock/members.ts";

const people = [
  { id: "p1", guardianId: null },
  { id: "c1", guardianId: "p1" },
  { id: "c2", guardianId: "p1" },
  { id: "s1", guardianId: null },
];

test("famille : un parent retrouve ses enfants, dans l'ordre de la liste", () => {
  const family = getFamily("p1", people);
  assert.equal(family.guardian, null);
  assert.deepEqual(family.children.map((m) => m.id), ["c1", "c2"]);
});

test("famille : un enfant retrouve son parent et n'a pas d'enfant", () => {
  const family = getFamily("c1", people);
  assert.equal(family.guardian?.id, "p1");
  assert.deepEqual(family.children, []);
});

test("famille : un membre sans rattachement a une famille vide", () => {
  assert.deepEqual(getFamily("s1", people), { guardian: null, children: [] });
});

test("famille : un identifiant inconnu ne plante pas", () => {
  assert.deepEqual(getFamily("inconnu", people), { guardian: null, children: [] });
});

test("famille : un parent introuvable donne guardian = null", () => {
  const orphans = [{ id: "c9", guardianId: "disparu" }];
  assert.deepEqual(getFamily("c9", orphans), { guardian: null, children: [] });
});

test("famille : un membre qui serait son propre parent est ignoré", () => {
  const loop = [{ id: "x1", guardianId: "x1" }];
  assert.deepEqual(getFamily("x1", loop), { guardian: null, children: [] });
});

test("données factices : guardianName est bien le nom du membre désigné par guardianId", () => {
  for (const m of mockMembers) {
    if (m.guardianId === null) {
      assert.equal(m.guardianName, null, `${m.id} : guardianName sans guardianId`);
      continue;
    }
    const guardian = mockMembers.find((g) => g.id === m.guardianId);
    assert.ok(guardian, `${m.id} : le parent ${m.guardianId} n'existe pas`);
    assert.equal(m.guardianName, `${guardian.firstName} ${guardian.lastName}`);
  }
});