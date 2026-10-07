import {
    Users, Megaphone, Paintbrush, Cpu, Headset, DollarSign, Heart, Utensils, Cake,
    Handshake, BookOpen, Wallet, GraduationCap, Dumbbell, Briefcase, UserCheck, Star,
    Award, Rocket, Shield, Zap, Target, Globe, Code, Smartphone, Cloud, ChartColumn,
    Lightbulb, Clock, CircleCheck, TrendingUp, Layers, Settings, Mail, Phone, MapPin,
    Building2, Coffee, Gift, Plane, Laptop, Share2, PenTool, Search, CircleHelp,
    Database, Server, Lock, Sparkles, ThumbsUp,
} from "lucide-react";

// Icons the admin can choose from in Site Content. Keys are stored in the DB,
// so only ever add to this list; renaming a key breaks saved content.
export const ICONS = {
    Users, Megaphone, Paintbrush, Cpu, Headset, DollarSign, Heart, Utensils, Cake,
    Handshake, BookOpen, Wallet, GraduationCap, Dumbbell, Briefcase, UserCheck, Star,
    Award, Rocket, Shield, Zap, Target, Globe, Code, Smartphone, Cloud, ChartColumn,
    Lightbulb, Clock, CircleCheck, TrendingUp, Layers, Settings, Mail, Phone, MapPin,
    Building2, Coffee, Gift, Plane, Laptop, Share2, PenTool, Search, CircleHelp,
    Database, Server, Lock, Sparkles, ThumbsUp,
};

export const ICON_NAMES = Object.keys(ICONS);

export default function DynamicIcon({ name, fallback = "Star", ...props }) {
    const Icon = ICONS[name] || ICONS[fallback];
    return <Icon {...props} />;
}
