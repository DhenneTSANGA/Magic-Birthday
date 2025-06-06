"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Copy, Mail, MessageCircle, PartyPopper, Plus, Share2, Trash2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function Invites() {
  const [invites, setInvites] = useState<
    { name: string; email: string; status: "pending" | "confirmed" | "declined" }[]
  >([
    { name: "Martin Dupont", email: "martin@example.com", status: "confirmed" },
    { name: "Jean Martin", email: "jean@example.com", status: "pending" },
    { name: "Sophie Lefebvre", email: "sophie@example.com", status: "declined" },
    { name: "Thomas Bernard", email: "thomas@example.com", status: "confirmed" },
    { name: "Julie Petit", email: "julie@example.com", status: "pending" },
  ])

  const [newInvite, setNewInvite] = useState({ name: "", email: "" })

  const handleAddInvite = () => {
    if (newInvite.name && newInvite.email) {
      setInvites([...invites, { ...newInvite, status: "pending" }])
      setNewInvite({ name: "", email: "" })
    }
  }

  const handleRemoveInvite = (email: string) => {
    setInvites(invites.filter((invite) => invite.email !== email))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewInvite((prev) => ({ ...prev, [name]: value }))
  }

  const confirmed = invites.filter((invite) => invite.status === "confirmed").length
  const pending = invites.filter((invite) => invite.status === "pending").length
  const declined = invites.filter((invite) => invite.status === "declined").length

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-blue-600">MAGIC BIRTHDAY</span>
            </Link>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600">
              Accueil
            </Link>
            <Link
              href="/creer-evenement"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              Créer un événement
            </Link>
            <Link
              href="/communaute"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              Communauté
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden border-blue-200 text-blue-600 hover:bg-blue-50 md:flex">
              Se connecter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">S&apos;inscrire</Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
        <div className="flex items-center justify-around">
          <Link href="/" className="flex flex-1 flex-col items-center py-2">
            <PartyPopper className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Accueil</span>
          </Link>
          <Link href="/creer-evenement" className="flex flex-1 flex-col items-center py-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Créer</span>
          </Link>
          <Link href="/communaute" className="flex flex-1 flex-col items-center py-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            <span className="text-xs text-gray-600">Communauté</span>
          </Link>
          <Link href="#" className="flex flex-1 flex-col items-center py-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-blue-600">Profil</span>
          </Link>
        </div>
      </div>

      <main className="flex-1 py-12 pb-24 md:pb-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à l&apos;événement
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-blue-800 md:text-4xl">Gestion des invités</h1>
            <p className="mt-2 text-gray-600">Anniversaire de Sophie - 15 juillet 2025</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="border-blue-200 bg-white shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span>Liste des invités</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-white text-blue-600 hover:bg-white/90">
                          <Plus className="mr-1 h-4 w-4" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-blue-200">
                        <DialogHeader>
                          <DialogTitle>Ajouter un invité</DialogTitle>
                          <DialogDescription>
                            Ajoutez les informations de votre invité pour lui envoyer une invitation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Nom de l'invité"
                              value={newInvite.name}
                              onChange={handleChange}
                              className="border-blue-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="email@example.com"
                              value={newInvite.email}
                              onChange={handleChange}
                              className="border-blue-200"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setNewInvite({ name: "", email: "" })}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Annuler
                          </Button>
                          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddInvite}>
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Gérez vos invités et suivez leurs réponses
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-4 bg-blue-100">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Tous <span className="ml-1 text-xs">({invites.length})</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="confirmed"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Confirmés <span className="ml-1 text-xs">({confirmed})</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        En attente <span className="ml-1 text-xs">({pending})</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="declined"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Refusés <span className="ml-1 text-xs">({declined})</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <div className="space-y-4">
                        {invites.map((invite, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-4 shadow-md transition-all hover:shadow-lg"
                          >
                            <div>
                              <p className="font-medium text-blue-800">{invite.name}</p>
                              <p className="text-sm text-gray-600">{invite.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  invite.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : invite.status === "declined"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {invite.status === "confirmed"
                                  ? "Confirmé"
                                  : invite.status === "declined"
                                    ? "Refusé"
                                    : "En attente"}
                              </span>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.email)}>
                                <Trash2 className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="confirmed" className="mt-4">
                      <div className="space-y-4">
                        {invites
                          .filter((invite) => invite.status === "confirmed")
                          .map((invite, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-4 shadow-md transition-all hover:shadow-lg"
                            >
                              <div>
                                <p className="font-medium text-blue-800">{invite.name}</p>
                                <p className="text-sm text-gray-600">{invite.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                  Confirmé
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.email)}>
                                  <Trash2 className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="pending" className="mt-4">
                      <div className="space-y-4">
                        {invites
                          .filter((invite) => invite.status === "pending")
                          .map((invite, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-4 shadow-md transition-all hover:shadow-lg"
                            >
                              <div>
                                <p className="font-medium text-blue-800">{invite.name}</p>
                                <p className="text-sm text-gray-600">{invite.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                  En attente
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.email)}>
                                  <Trash2 className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="declined" className="mt-4">
                      <div className="space-y-4">
                        {invites
                          .filter((invite) => invite.status === "declined")
                          .map((invite, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-4 shadow-md transition-all hover:shadow-lg"
                            >
                              <div>
                                <p className="font-medium text-blue-800">{invite.name}</p>
                                <p className="text-sm text-gray-600">{invite.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                  Refusé
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.email)}>
                                  <Trash2 className="h-4 w-4 text-gray-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="space-y-6">
                <Card className="border-blue-200 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <CardTitle>Statistiques</CardTitle>
                    <CardDescription className="text-white/80">Aperçu des réponses de vos invités</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Total des invités</span>
                        <span className="font-bold text-blue-800">{invites.length}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: "100%" }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Confirmés</span>
                        <span className="font-bold text-green-600">{confirmed}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${(confirmed / invites.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">En attente</span>
                        <span className="font-bold text-yellow-600">{pending}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${(pending / invites.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">Refusés</span>
                        <span className="font-bold text-red-600">{declined}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${(declined / invites.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <CardTitle>Partager l&apos;invitation</CardTitle>
                    <CardDescription className="text-white/80">Envoyez l&apos;invitation à vos amis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3">
                      <span className="text-sm text-blue-800">https://cree-ton-anniversaire.com/e/sophie-25ans</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer par email
                      </Button>
                      <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager le lien
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <CardTitle>Message personnalisé</CardTitle>
                    <CardDescription className="text-white/80">Ajoutez un message à votre invitation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      placeholder="Écrivez un message personnalisé pour vos invités..."
                      className="min-h-[100px] border-blue-200"
                    />
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 bg-blue-50 p-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-blue-900 py-6 text-white">
        <div className="container px-4 text-center text-sm text-white/70 md:px-6">
          <p>© 2025 MAGIC BIRTHDAY. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
