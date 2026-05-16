import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MessageSquare, FileText, Bell, Globe, X, Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLandingContent } from '@/contexts/LandingContentContext';

export default function SystemSettingsPage() {
  const { content: landingContent, updateContent: updateLandingContent } = useLandingContent();
  const [landingEdit, setLandingEdit] = useState(landingContent);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(landingContent.hero.images);
  const [awarenessImageUrl, setAwarenessImageUrl] = useState<string>(landingContent.awareness.image);
  const [settings, setSettings] = useState({
    smsTemplates: {
      discharge: 'Dear {contact_name}, {patient_name} has been discharged from the recovery center. Recovery Status: {status}. Please contact us for follow-up support.',
      emergency: 'EMERGENCY ALERT: {patient_name} requires immediate attention. Please contact the facility.',
      appointment: 'Reminder: {patient_name} has an appointment scheduled for {date} at {time}.',
      medication: 'Medication reminder for {patient_name}: Please take {medicine} as prescribed.',
    },
    pdfSettings: {
      headerText: 'Recovery Center Management System',
      footerText: 'This is an official document from the Rehabilitation Center',
      logoUrl: '',
    },
    notificationSettings: {
      emailEnabled: true,
      smsEnabled: true,
      autoBackup: true,
      backupFrequency: 'daily',
    },
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    toast({ title: 'Success', description: 'Settings saved successfully' });
  };

  const handleSaveLandingContent = () => {
    updateLandingContent(landingEdit);
    toast({ title: 'Success', description: 'Landing page content updated successfully' });
  };

  const handleLandingChange = (field: string, value: string) => {
    setLandingEdit(prev => {
      const parts = field.split('.');
      if (parts.length === 2) {
        return {
          ...prev,
          [parts[0]]: {
            ...prev[parts[0] as keyof typeof prev],
            [parts[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleLandingLinkChange = (index: number, key: 'label' | 'path', value: string) => {
    setLandingEdit(prev => ({
      ...prev,
      navbar: {
        ...prev.navbar,
        links: prev.navbar.links.map((link, i) => i === index ? { ...link, [key]: value } : link),
      },
    }));
  };

  const handleAboutPreviewStatChange = (index: number, value: string) => {
    setLandingEdit(prev => ({
      ...prev,
      aboutPreview: {
        ...prev.aboutPreview,
        stats: prev.aboutPreview.stats.map((stat, i) => (i === index ? value : stat)),
      },
    }));
  };

  const handleHowItWorksStepChange = (index: number, key: 'title' | 'description', value: string) => {
    setLandingEdit(prev => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        steps: prev.howItWorks.steps.map((step, i) => (i === index ? { ...step, [key]: value } : step)),
      },
    }));
  };

  const handleFooterSocialLinkChange = (index: number, key: 'label' | 'href', value: string) => {
    setLandingEdit(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: prev.footer.socialLinks.map((link, i) => i === index ? { ...link, [key]: value } : link),
      },
    }));
  };

  const handleAboutPageValueChange = (index: number, key: 'title' | 'text', value: string) => {
    setLandingEdit(prev => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        values: prev.aboutPage.values.map((valueObj, i) => (i === index ? { ...valueObj, [key]: value } : valueObj)),
      },
    }));
  };

  const handleAwarenessImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setAwarenessImageUrl(base64String);
      setLandingEdit(prev => ({
        ...prev,
        awareness: {
          ...prev.awareness,
          image: base64String,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      const newImages = [...imagePreviewUrls];
      newImages[index] = base64String;
      setImagePreviewUrls(newImages);
      
      // Update landing edit state
      setLandingEdit(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          images: newImages,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newImages = imagePreviewUrls.filter((_, i) => i !== index);
    setImagePreviewUrls(newImages);
    setLandingEdit(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        images: newImages,
      },
    }));
  };

  const addNewImageSlot = () => {
    setImagePreviewUrls([...imagePreviewUrls, '']);
    setLandingEdit(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        images: [...prev.hero.images, ''],
      },
    }));
  };

  const handleSmsTemplateChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      smsTemplates: {
        ...prev.smsTemplates,
        [key]: value,
      },
    }));
  };

  const handlePdfSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      pdfSettings: {
        ...prev.pdfSettings,
        [key]: value,
      },
    }));
  };

  const handleNotificationChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('systemSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setLandingEdit(landingContent);
    setImagePreviewUrls(landingContent.hero.images);
    setAwarenessImageUrl(landingContent.awareness.image);
  }, [landingContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          System Settings
        </h1>
        <p className="text-slate-600 mt-2">Configure system-wide settings for SMS, PDF, and notifications</p>
      </div>

      <Tabs defaultValue="sms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="landing" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Landing
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="awareness" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Awareness
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notify
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Content</CardTitle>
              <CardDescription>Edit hero section, contact information, and organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero-title">Hero Title</Label>
                    <Input
                      id="hero-title"
                      value={landingEdit.hero.title}
                      onChange={(e) => handleLandingChange('hero.title', e.target.value)}
                      placeholder="Enter hero title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={landingEdit.hero.subtitle}
                      onChange={(e) => handleLandingChange('hero.subtitle', e.target.value)}
                      placeholder="Enter hero subtitle"
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero-button">Hero Button Text</Label>
                    <Input
                      id="hero-button"
                      value={landingEdit.hero.buttonText}
                      onChange={(e) => handleLandingChange('hero.buttonText', e.target.value)}
                      placeholder="Enter hero button text"
                      className="mt-2"
                    />
                  </div>
                  <div className="border-t pt-4">
                    <Label className="block mb-3">Hero Carousel Images</Label>
                    <div className="space-y-4">
                      {imagePreviewUrls.map((imgUrl, idx) => (
                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-slate-700">Image {idx + 1}</span>
                            {imagePreviewUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {imgUrl && (
                            <div className="mb-3 w-full">
                              <img
                                src={imgUrl}
                                alt={`Hero ${idx + 1}`}
                                className="w-full h-32 object-cover rounded border border-slate-200"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded p-4 bg-white hover:border-slate-400 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(idx, file);
                              }}
                              className="w-full h-full opacity-0 absolute cursor-pointer"
                              style={{ position: 'absolute', left: '-9999px' }}
                            />
                            <label
                              htmlFor={`image-${idx}`}
                              className="text-center cursor-pointer"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                input.click();
                              }}
                            >
                              <div className="text-sm text-slate-600">
                                <p className="font-medium">Click to upload image</p>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                              </div>
                            </label>
                            <input
                              id={`image-${idx}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(idx, file);
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addNewImageSlot}
                        className="w-full"
                      >
                        + Add Another Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact-title">Contact Title</Label>
                    <Input
                      id="contact-title"
                      value={landingEdit.contact.title}
                      onChange={(e) => handleLandingChange('contact.title', e.target.value)}
                      placeholder="Enter contact section title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      value={landingEdit.contact.email}
                      onChange={(e) => handleLandingChange('contact.email', e.target.value)}
                      placeholder="Enter email address"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input
                      id="contact-phone"
                      value={landingEdit.contact.phone}
                      onChange={(e) => handleLandingChange('contact.phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-address">Address</Label>
                    <Textarea
                      id="contact-address"
                      value={landingEdit.contact.address}
                      onChange={(e) => handleLandingChange('contact.address', e.target.value)}
                      placeholder="Enter address"
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Navbar</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="navbar-brand">Navbar Brand</Label>
                    <Input
                      id="navbar-brand"
                      value={landingEdit.navbar.brand}
                      onChange={(e) => handleLandingChange('navbar.brand', e.target.value)}
                      placeholder="Enter navbar brand"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="navbar-logo">Navbar Logo URL</Label>
                    <Input
                      id="navbar-logo"
                      value={landingEdit.navbar.logoUrl}
                      onChange={(e) => handleLandingChange('navbar.logoUrl', e.target.value)}
                      placeholder="Enter navbar logo URL"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="navbar-login">Navbar Login Text</Label>
                    <Input
                      id="navbar-login"
                      value={landingEdit.navbar.loginText}
                      onChange={(e) => handleLandingChange('navbar.loginText', e.target.value)}
                      placeholder="Enter navbar login text"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="block mb-3">Navbar Links</Label>
                    <div className="space-y-3">
                      {landingEdit.navbar.links.map((link, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={link.label}
                            onChange={(e) => handleLandingLinkChange(index, 'label', e.target.value)}
                            placeholder={`Link ${index + 1} label`}
                            className="mt-2"
                          />
                          <Input
                            value={link.path}
                            onChange={(e) => handleLandingLinkChange(index, 'path', e.target.value)}
                            placeholder={`Link ${index + 1} path`}
                            className="mt-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">About Preview</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preview-title">Preview Title</Label>
                    <Input
                      id="preview-title"
                      value={landingEdit.aboutPreview.title}
                      onChange={(e) => handleLandingChange('aboutPreview.title', e.target.value)}
                      placeholder="Enter preview title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preview-description">Preview Description</Label>
                    <Textarea
                      id="preview-description"
                      value={landingEdit.aboutPreview.description}
                      onChange={(e) => handleLandingChange('aboutPreview.description', e.target.value)}
                      placeholder="Enter preview description"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preview-button">Preview Button Text</Label>
                    <Input
                      id="preview-button"
                      value={landingEdit.aboutPreview.buttonText}
                      onChange={(e) => handleLandingChange('aboutPreview.buttonText', e.target.value)}
                      placeholder="Enter preview button text"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="block mb-3">Preview Stats</Label>
                    <div className="space-y-3">
                      {landingEdit.aboutPreview.stats.map((stat, index) => (
                        <Input
                          key={index}
                          value={stat}
                          onChange={(e) => handleAboutPreviewStatChange(index, e.target.value)}
                          placeholder={`Stat ${index + 1}`}
                          className="mt-2"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="how-title">Section Title</Label>
                    <Input
                      id="how-title"
                      value={landingEdit.howItWorks.title}
                      onChange={(e) => handleLandingChange('howItWorks.title', e.target.value)}
                      placeholder="Enter section title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="how-subtitle">Section Subtitle</Label>
                    <Textarea
                      id="how-subtitle"
                      value={landingEdit.howItWorks.subtitle}
                      onChange={(e) => handleLandingChange('howItWorks.subtitle', e.target.value)}
                      placeholder="Enter section subtitle"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  {landingEdit.howItWorks.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={step.title}
                          onChange={(e) => handleHowItWorksStepChange(index, 'title', e.target.value)}
                          placeholder={`Step ${index + 1} title`}
                          className="mt-2"
                        />
                        <Textarea
                          value={step.description}
                          onChange={(e) => handleHowItWorksStepChange(index, 'description', e.target.value)}
                          placeholder={`Step ${index + 1} description`}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b pb-6">
                <h3 className="font-semibold mb-4">Footer</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="footer-brand">Footer Brand</Label>
                    <Input
                      id="footer-brand"
                      value={landingEdit.footer.brandName}
                      onChange={(e) => handleLandingChange('footer.brandName', e.target.value)}
                      placeholder="Enter footer brand name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer-copyright">Footer Copyright</Label>
                    <Input
                      id="footer-copyright"
                      value={landingEdit.footer.copyright}
                      onChange={(e) => handleLandingChange('footer.copyright', e.target.value)}
                      placeholder="Enter footer copyright text"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="block mb-3">Footer Social Links</Label>
                    <div className="space-y-3">
                      {landingEdit.footer.socialLinks.map((link, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={link.label}
                            onChange={(e) => handleFooterSocialLinkChange(index, 'label', e.target.value)}
                            placeholder={`Social label ${index + 1}`}
                            className="mt-2"
                          />
                          <Input
                            value={link.href}
                            onChange={(e) => handleFooterSocialLinkChange(index, 'href', e.target.value)}
                            placeholder={`Social URL ${index + 1}`}
                            className="mt-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveLandingContent} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
              Save Landing Page Content
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
              <CardDescription>Edit about page title, description, mission statement, and key values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="about-title">Page Title</Label>
                <Input
                  id="about-title"
                  value={landingEdit.aboutPage.title}
                  onChange={(e) => handleLandingChange('aboutPage.title', e.target.value)}
                  placeholder="Enter about page title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="about-description">Description</Label>
                <Textarea
                  id="about-description"
                  value={landingEdit.aboutPage.description}
                  onChange={(e) => handleLandingChange('aboutPage.description', e.target.value)}
                  placeholder="Enter about page description"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="about-mission">Mission Statement</Label>
                <Textarea
                  id="about-mission"
                  value={landingEdit.aboutPage.mission}
                  onChange={(e) => handleLandingChange('aboutPage.mission', e.target.value)}
                  placeholder="Enter mission statement"
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label className="block mb-3">About Page Values</Label>
                <div className="space-y-4">
                  {landingEdit.aboutPage.values.map((valueItem, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-slate-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={valueItem.title}
                          onChange={(e) => handleAboutPageValueChange(index, 'title', e.target.value)}
                          placeholder={`Value ${index + 1} title`}
                          className="mt-2"
                        />
                        <Textarea
                          value={valueItem.text}
                          onChange={(e) => handleAboutPageValueChange(index, 'text', e.target.value)}
                          placeholder={`Value ${index + 1} text`}
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveLandingContent} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
              Save About Content
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="awareness">
          <Card>
            <CardHeader>
              <CardTitle>Say No to Alcohol Campaign</CardTitle>
              <CardDescription>Edit awareness campaign title, description, and image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="awareness-title">Campaign Title</Label>
                <Input
                  id="awareness-title"
                  value={landingEdit.awareness.title}
                  onChange={(e) => handleLandingChange('awareness.title', e.target.value)}
                  placeholder="Enter campaign title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="awareness-description">Campaign Description</Label>
                <Textarea
                  id="awareness-description"
                  value={landingEdit.awareness.description}
                  onChange={(e) => handleLandingChange('awareness.description', e.target.value)}
                  placeholder="Enter campaign description"
                  className="mt-2"
                  rows={5}
                />
              </div>
              <div className="border-t pt-4">
                <Label className="block mb-3">Campaign Image</Label>
                <div className="border rounded-lg p-4 bg-slate-50">
                  {awarenessImageUrl && (
                    <div className="mb-3 w-full">
                      <img
                        src={awarenessImageUrl}
                        alt="Awareness campaign"
                        className="w-full h-40 object-cover rounded border border-slate-200"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded p-4 bg-white hover:border-slate-400 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAwarenessImageUpload(file);
                      }}
                      className="hidden"
                      id="awareness-image-input"
                    />
                    <label
                      htmlFor="awareness-image-input"
                      className="text-center cursor-pointer w-full"
                    >
                      <div className="text-sm text-slate-600">
                        <p className="font-medium">Click to upload image</p>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveLandingContent} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
              Save Awareness Content
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Message Templates</CardTitle>
              <CardDescription>
                Customize SMS templates for different scenarios. Use placeholders like {'{patient_name}'}, {'{contact_name}'}, {'{status}'}, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="discharge-template">Discharge Notification</Label>
                <Textarea
                  id="discharge-template"
                  value={settings.smsTemplates.discharge}
                  onChange={(e) => handleSmsTemplateChange('discharge', e.target.value)}
                  placeholder="Enter discharge SMS template"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="emergency-template">Emergency Alert</Label>
                <Textarea
                  id="emergency-template"
                  value={settings.smsTemplates.emergency}
                  onChange={(e) => handleSmsTemplateChange('emergency', e.target.value)}
                  placeholder="Enter emergency SMS template"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="appointment-template">Appointment Reminder</Label>
                <Textarea
                  id="appointment-template"
                  value={settings.smsTemplates.appointment}
                  onChange={(e) => handleSmsTemplateChange('appointment', e.target.value)}
                  placeholder="Enter appointment SMS template"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="medication-template">Medication Reminder</Label>
                <Textarea
                  id="medication-template"
                  value={settings.smsTemplates.medication}
                  onChange={(e) => handleSmsTemplateChange('medication', e.target.value)}
                  placeholder="Enter medication SMS template"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf">
          <Card>
            <CardHeader>
              <CardTitle>PDF Document Settings</CardTitle>
              <CardDescription>Configure PDF header, footer, and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="header-text">Header Text</Label>
                <Input
                  id="header-text"
                  value={settings.pdfSettings.headerText}
                  onChange={(e) => handlePdfSettingChange('headerText', e.target.value)}
                  placeholder="Enter PDF header text"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="footer-text">Footer Text</Label>
                <Input
                  id="footer-text"
                  value={settings.pdfSettings.footerText}
                  onChange={(e) => handlePdfSettingChange('footerText', e.target.value)}
                  placeholder="Enter PDF footer text"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="logo-url">Logo URL (optional)</Label>
                <Input
                  id="logo-url"
                  value={settings.pdfSettings.logoUrl}
                  onChange={(e) => handlePdfSettingChange('logoUrl', e.target.value)}
                  placeholder="Enter logo image URL"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences and automated alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email-enabled"
                  checked={settings.notificationSettings.emailEnabled}
                  onChange={(e) => handleNotificationChange('emailEnabled', e.target.checked)}
                />
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms-enabled"
                  checked={settings.notificationSettings.smsEnabled}
                  onChange={(e) => handleNotificationChange('smsEnabled', e.target.checked)}
                />
                <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-backup"
                  checked={settings.notificationSettings.autoBackup}
                  onChange={(e) => handleNotificationChange('autoBackup', e.target.checked)}
                />
                <Label htmlFor="auto-backup">Enable Automatic Backups</Label>
              </div>
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select
                  id="backup-frequency"
                  value={settings.notificationSettings.backupFrequency}
                  onChange={(e) => handleNotificationChange('backupFrequency', e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>System-wide configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  defaultValue="Recovery Center Management System"
                  placeholder="Enter system name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select className="w-full mt-2 p-2 border rounded">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="IST">India Standard Time</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Default Language</Label>
                <select className="w-full mt-2 p-2 border rounded">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-medical-teal hover:bg-medical-teal/90 text-white">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}